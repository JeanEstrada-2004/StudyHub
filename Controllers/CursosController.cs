using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.Data;
using StudyHub.Models;
using StudyHub.Filters;
using StudyHub.Services;

namespace StudyHub.Controllers
{
    [AutorizacionFilter]
    public class CursosController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly InvitacionServicio _invitaciones;

        public CursosController(ApplicationDbContext context, InvitacionServicio invitaciones)
        {
            _context = context;
            _invitaciones = invitaciones;
        }

        public async Task<IActionResult> Index()
        {
            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            var usuarioRol = HttpContext.Session.GetString("UsuarioRol");

            IQueryable<Curso> query = _context.Cursos
                .Include(c => c.Profesor)
                .Include(c => c.Clases)
                    .ThenInclude(cl => cl.Sesiones)
                .Include(c => c.UsuarioCursos);

            if (usuarioRol == "Profesor")
            {
                query = query.Where(c => c.ProfesorId == usuarioId);
            }
            else
            {
                var cursoIds = await _context.UsuarioCursos
                    .Where(uc => uc.UsuarioId == usuarioId && uc.Estado == "Aceptado")
                    .Select(uc => uc.CursoId)
                    .ToListAsync();
                query = query.Where(c => cursoIds.Contains(c.Id));
            }

            var cursos = await query.OrderBy(c => c.Nombre).ToListAsync();
            return View(cursos);
        }

        [RolFilter("Profesor")]
        public IActionResult Create() => View(new Curso());

        [HttpPost]
        [ValidateAntiForgeryToken]
        [RolFilter("Profesor")]
        public async Task<IActionResult> Create(Curso curso)
        {
            // Evitar validación del nav property no enlazado
            ModelState.Remove(nameof(Curso.Profesor));
            if (!ModelState.IsValid) return View(curso);

            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            curso.ProfesorId = usuarioId!.Value;
            _context.Cursos.Add(curso);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        public async Task<IActionResult> Details(int id)
        {
            var curso = await _context.Cursos
                .Include(c => c.Profesor)
                .Include(c => c.UsuarioCursos)
                .Include(c => c.Clases)
                    .ThenInclude(cl => cl.Sesiones)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (curso == null) return NotFound();
            return View(curso);
        }

        // Calendario por curso
        [AutorizacionFilter]
        public async Task<IActionResult> Calendario(int id)
        {
            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            var usuarioRol = HttpContext.Session.GetString("UsuarioRol");

            var curso = await _context.Cursos.FirstOrDefaultAsync(c => c.Id == id);
            if (curso == null) return NotFound();

            // Seguridad: profesor propietario o estudiante inscrito en el curso
            var autorizado = usuarioRol == "Profesor"
                ? curso.ProfesorId == usuarioId
                : await _context.UsuarioCursos.AnyAsync(uc => uc.CursoId == id && uc.UsuarioId == usuarioId && uc.Estado == "Aceptado");

            if (!autorizado)
                return RedirectToAction("AccesoDenegado", "Home");

            var sesiones = await _context.Sesiones
                .Include(s => s.Clase)
                .Where(s => s.Clase.CursoId == id)
                .OrderBy(s => s.FechaHora)
                .ToListAsync();

            ViewBag.Curso = curso;
            return View(sesiones);
        }

        [RolFilter("Profesor")]
        public async Task<IActionResult> Edit(int id)
        {
            var curso = await _context.Cursos
                .Include(c => c.Profesor)          // ← AÑADE ESTA LÍNEA
                .Include(c => c.Clases)
                .Include(c => c.UsuarioCursos)
                .FirstOrDefaultAsync(c => c.Id == id);
            if (curso == null) return NotFound();
            return View(curso);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [RolFilter("Profesor")]
        public async Task<IActionResult> Edit(int id, Curso curso)
        {
            if (id != curso.Id) return NotFound();

            ModelState.Remove(nameof(Curso.Profesor));
            if (!ModelState.IsValid) return View(curso);

            var current = await _context.Cursos.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
            if (current == null) return NotFound();

            curso.ProfesorId = current.ProfesorId;
            _context.Update(curso);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        [RolFilter("Profesor")]
        public async Task<IActionResult> Delete(int id)
        {
            var curso = await _context.Cursos.FindAsync(id);
            if (curso == null) return NotFound();
            return View(curso);
        }

        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        [RolFilter("Profesor")]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var curso = await _context.Cursos.FindAsync(id);
            if (curso == null) return NotFound();

            _context.Cursos.Remove(curso);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        // Explorar cursos disponibles (estudiante)
        public async Task<IActionResult> Explorar()
        {
            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            if (usuarioId == null) return RedirectToAction("Login", "Auth");

            var cursos = await _invitaciones.ObtenerCursosDisponibles(usuarioId.Value);
            return View(cursos);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> SolicitarUnirse(int cursoId)
        {
            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            if (usuarioId == null) return RedirectToAction("Login", "Auth");

            var ok = await _invitaciones.SolicitarUnirseACurso(cursoId, usuarioId.Value);
            TempData[ok ? "Success" : "Error"] = ok ? "Solicitud enviada." : "Ya existe una solicitud o pertenencia.";
            return RedirectToAction(nameof(Explorar));
        }

        // Invitaciones del estudiante
        public async Task<IActionResult> Invitaciones()
        {
            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            if (usuarioId == null) return RedirectToAction("Login", "Auth");

            var items = await _invitaciones.ObtenerInvitacionesPendientes(usuarioId.Value);
            return View(items);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> AceptarMiInvitacion(int usuarioCursoId)
        {
            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            if (usuarioId == null) return RedirectToAction("Login", "Auth");

            var ok = await _invitaciones.EstudianteAceptar(usuarioCursoId, usuarioId.Value);
            TempData[ok ? "Success" : "Error"] = ok ? "Invitación aceptada." : "No se pudo aceptar la invitación.";
            return RedirectToAction(nameof(Invitaciones));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RechazarMiInvitacion(int usuarioCursoId)
        {
            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            if (usuarioId == null) return RedirectToAction("Login", "Auth");

            var ok = await _invitaciones.EstudianteRechazar(usuarioCursoId, usuarioId.Value);
            TempData[ok ? "Success" : "Error"] = ok ? "Invitación rechazada." : "No se pudo rechazar la invitación.";
            return RedirectToAction(nameof(Invitaciones));
        }

        // Gestión de estudiantes por curso
        [RolFilter("Profesor")]
        public async Task<IActionResult> Alumnos(int id)
        {
            var curso = await _context.Cursos.Include(c => c.Clases).FirstOrDefaultAsync(c => c.Id == id);
            if (curso == null) return NotFound();

            var alumnos = await _context.UsuarioCursos
                .Where(uc => uc.CursoId == id)
                .Include(uc => uc.Usuario)
                .OrderBy(uc => uc.Usuario!.Nombre)
                .ToListAsync();

            // Usuarios disponibles para sugerencias de invitación (excluyendo los que ya están en el curso)
            var usuarioIdsCurso = alumnos.Select(uc => uc.UsuarioId).ToList();
            var usuariosBusqueda = await _context.Usuarios
                .Where(u => !usuarioIdsCurso.Contains(u.Id))
                .OrderBy(u => u.Nombre)
                .ToListAsync();

            ViewBag.Curso = curso;
            ViewBag.UsuariosBusqueda = usuariosBusqueda;
            return View(alumnos);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [RolFilter("Profesor")]
        public async Task<IActionResult> InvitarAlumno(int cursoId, string termino, string rol = "Estudiante")
        {
            var curso = await _context.Cursos.FirstOrDefaultAsync(c => c.Id == cursoId);
            if (curso == null) return NotFound();

            if (string.IsNullOrWhiteSpace(termino))
            {
                TempData["Error"] = "Debes ingresar un nombre o email para buscar al estudiante.";
                return RedirectToAction(nameof(Alumnos), new { id = cursoId });
            }

            termino = termino.Trim();

            // Primero intentar coincidencia exacta por email
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == termino);

            // Si no se encuentra por email, buscar por nombre (contiene, sin distinción de mayúsculas)
            if (usuario == null)
            {
                var terminoLike = $"%{termino}%";
                usuario = await _context.Usuarios
                    .FirstOrDefaultAsync(u => EF.Functions.ILike(u.Nombre, terminoLike));
            }

            if (usuario == null)
            {
                TempData["Error"] = "No se encontró ningún usuario con ese nombre o email.";
                return RedirectToAction(nameof(Alumnos), new { id = cursoId });
            }

            var ya = await _context.UsuarioCursos.AnyAsync(uc => uc.CursoId == cursoId && uc.UsuarioId == usuario.Id);
            if (ya)
            {
                TempData["Error"] = "El usuario ya pertenece al curso.";
                return RedirectToAction(nameof(Alumnos), new { id = cursoId });
            }

            _context.UsuarioCursos.Add(new UsuarioCurso
            {
                CursoId = cursoId,
                UsuarioId = usuario.Id,
                Rol = string.IsNullOrWhiteSpace(rol) ? "Estudiante" : rol,
                Estado = "Invitado",
                FechaUnion = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();
            TempData["Success"] = "Invitación enviada.";
            return RedirectToAction(nameof(Alumnos), new { id = cursoId });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [RolFilter("Profesor")]
        public async Task<IActionResult> Aceptar(int usuarioCursoId)
        {
            var uc = await _context.UsuarioCursos.Include(x => x.Curso).FirstOrDefaultAsync(x => x.Id == usuarioCursoId);
            if (uc == null) return NotFound();

            uc.Estado = "Aceptado";
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Alumnos), new { id = uc.CursoId });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [RolFilter("Profesor")]
        public async Task<IActionResult> Rechazar(int usuarioCursoId)
        {
            var uc = await _context.UsuarioCursos.Include(x => x.Curso).FirstOrDefaultAsync(x => x.Id == usuarioCursoId);
            if (uc == null) return NotFound();

            uc.Estado = "Rechazado";
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Alumnos), new { id = uc.CursoId });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [RolFilter("Profesor")]
        public async Task<IActionResult> CambiarRolAlumno(int usuarioCursoId, string nuevoRol)
        {
            var uc = await _context.UsuarioCursos
                .Include(x => x.Curso)
                .FirstOrDefaultAsync(x => x.Id == usuarioCursoId);
            if (uc == null) return NotFound();

            // Solo el profesor propietario del curso puede cambiar roles
            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            if (uc.Curso == null || uc.Curso.ProfesorId != usuarioId)
                return RedirectToAction("AccesoDenegado", "Home");

            if (nuevoRol != "Estudiante" && nuevoRol != "Delegado")
            {
                TempData["Error"] = "Rol no válido.";
                return RedirectToAction(nameof(Alumnos), new { id = uc.CursoId });
            }

            uc.Rol = nuevoRol;
            await _context.SaveChangesAsync();

            TempData["Success"] = "Rol del estudiante actualizado correctamente.";
            return RedirectToAction(nameof(Alumnos), new { id = uc.CursoId });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [RolFilter("Profesor")]
        public async Task<IActionResult> EliminarAlumno(int usuarioCursoId)
        {
            var uc = await _context.UsuarioCursos
                .Include(x => x.Curso)
                .FirstOrDefaultAsync(x => x.Id == usuarioCursoId);
            if (uc == null) return NotFound();

            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            if (uc.Curso == null || uc.Curso.ProfesorId != usuarioId)
                return RedirectToAction("AccesoDenegado", "Home");

            var cursoId = uc.CursoId;
            _context.UsuarioCursos.Remove(uc);
            await _context.SaveChangesAsync();

            TempData["Success"] = "Estudiante eliminado del curso.";
            return RedirectToAction(nameof(Alumnos), new { id = cursoId });
        }
    }
}
