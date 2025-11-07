using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc.Rendering;
using StudyHub.Data;
using StudyHub.Filters;
using StudyHub.Models;

namespace StudyHub.Controllers
{
    [AutorizacionFilter]
    public class ClasesController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ClasesController> _logger;

        public ClasesController(ApplicationDbContext context, ILogger<ClasesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: Clases
        public async Task<IActionResult> Index()
        {
            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            var usuarioRol = HttpContext.Session.GetString("UsuarioRol");

            List<Clase> clases;
            if (usuarioRol == "Profesor")
            {
                clases = await _context.Clases
                    .Where(c => c.ProfesorId == usuarioId)
                    .OrderByDescending(c => c.FechaCreacion)
                    .ToListAsync();
            }
            else
            {
                clases = await _context.UsuarioClases
                    .Where(uc => uc.UsuarioId == usuarioId && uc.Estado == "Aceptado")
                    .Include(uc => uc.Clase)
                    .Select(uc => uc.Clase)
                    .OrderByDescending(c => c!.FechaCreacion)
                    .OfType<Clase>()
                    .ToListAsync();
            }

            return View(clases);
        }

        // GET: Clases/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null) return NotFound();

            var clase = await _context.Clases
                .Include(c => c.Profesor)
                .Include(c => c.Curso)
                .FirstOrDefaultAsync(c => c.Id == id);
            if (clase == null) return NotFound();

            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            var usuarioRol = HttpContext.Session.GetString("UsuarioRol");
            var tieneAcceso = usuarioRol == "Profesor" ? clase.ProfesorId == usuarioId : await _context.UsuarioClases.AnyAsync(uc => uc.UsuarioId == usuarioId && uc.ClaseId == clase.Id && uc.Estado == "Aceptado");
            if (!tieneAcceso) return RedirectToAction("AccesoDenegado", "Home");

            return View(clase);
        }

        // GET: Clases/Create
        [RolFilter("Profesor")]
        public IActionResult Create()
        {
            ViewBag.Cursos = new SelectList(_context.Cursos.Where(c => c.Activo).OrderBy(c => c.Nombre), nameof(Curso.Id), nameof(Curso.Nombre));
            return View();
        }

        // POST: Clases/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        [RolFilter("Profesor")]
        public async Task<IActionResult> Create([Bind("Titulo,Descripcion,CursoId,EsPublica,MaxEstudiantes")] Clase clase)
        {
            ModelState.Remove("Profesor");
            ModelState.Remove("ProfesorId");

            if (!ModelState.IsValid)
            {
                ViewBag.Cursos = new SelectList(_context.Cursos.Where(c => c.Activo).OrderBy(c => c.Nombre), nameof(Curso.Id), nameof(Curso.Nombre), clase.CursoId);
                return View(clase);
            }

            try
            {
                var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
                clase.ProfesorId = usuarioId!.Value;
                clase.FechaCreacion = DateTime.UtcNow;
                _context.Clases.Add(clase);
                await _context.SaveChangesAsync();
                TempData["Success"] = "Clase creada exitosamente.";
                return RedirectToAction(nameof(Index));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear clase");
                TempData["Error"] = "Error al crear la clase.";
                ViewBag.Cursos = new SelectList(_context.Cursos.Where(c => c.Activo).OrderBy(c => c.Nombre), nameof(Curso.Id), nameof(Curso.Nombre), clase.CursoId);
                return View(clase);
            }
        }

        // GET: Clases/Edit/5
        [RolFilter("Profesor")]
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null) return NotFound();
            var clase = await _context.Clases.FindAsync(id);
            if (clase == null) return NotFound();
            if (clase.ProfesorId != HttpContext.Session.GetInt32("UsuarioId")) return RedirectToAction("AccesoDenegado", "Home");
            ViewBag.Cursos = new SelectList(_context.Cursos.Where(c => c.Activo).OrderBy(c => c.Nombre), nameof(Curso.Id), nameof(Curso.Nombre), clase.CursoId);
            return View(clase);
        }

        // POST: Clases/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        [RolFilter("Profesor")]
        public async Task<IActionResult> Edit(int id, [Bind("Id,Titulo,Descripcion,CursoId,EsPublica,MaxEstudiantes")] Clase clase)
        {
            ModelState.Remove("Profesor");
            ModelState.Remove("ProfesorId");

            if (id != clase.Id) return NotFound();

            var original = await _context.Clases.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
            if (original == null) return NotFound();
            if (original.ProfesorId != HttpContext.Session.GetInt32("UsuarioId")) 
                return RedirectToAction("AccesoDenegado", "Home");

            if (!ModelState.IsValid)
            {
                ViewBag.Cursos = new SelectList(_context.Cursos.Where(c => c.Activo).OrderBy(c => c.Nombre), nameof(Curso.Id), nameof(Curso.Nombre), clase.CursoId);
                return View(clase);
            }

            clase.ProfesorId = original.ProfesorId;
            _context.Update(clase);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Clase actualizada exitosamente.";
            return RedirectToAction(nameof(Index));
        }

        // GET: Clases/Delete/5
        [RolFilter("Profesor")]
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null) return NotFound();
            var clase = await _context.Clases.FirstOrDefaultAsync(c => c.Id == id);
            if (clase == null) return NotFound();
            if (clase.ProfesorId != HttpContext.Session.GetInt32("UsuarioId")) return RedirectToAction("AccesoDenegado", "Home");
            return View(clase);
        }

        // POST: Clases/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        [RolFilter("Profesor")]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var clase = await _context.Clases.FindAsync(id);
            if (clase == null) return NotFound();
            if (clase.ProfesorId != HttpContext.Session.GetInt32("UsuarioId")) return RedirectToAction("AccesoDenegado", "Home");
            _context.Clases.Remove(clase);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        // Gestión de estudiantes
        [RolFilter("Profesor")]
        public async Task<IActionResult> Alumnos(int id)
        {
            var clase = await _context.Clases.FindAsync(id);
            if (clase == null) return NotFound();
            if (clase.ProfesorId != HttpContext.Session.GetInt32("UsuarioId")) return RedirectToAction("AccesoDenegado", "Home");

            var alumnos = await _context.UsuarioClases
                .Where(uc => uc.ClaseId == id)
                .Include(uc => uc.Usuario)
                .OrderBy(uc => uc.Usuario!.Nombre)
                .ToListAsync();

            ViewBag.Clase = clase;
            return View(alumnos);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [RolFilter("Profesor")]
        public async Task<IActionResult> AgregarAlumno(int claseId, string email, string rol = "Estudiante")
        {
            var clase = await _context.Clases.FindAsync(claseId);
            if (clase == null) return NotFound();
            if (clase.ProfesorId != HttpContext.Session.GetInt32("UsuarioId")) return RedirectToAction("AccesoDenegado", "Home");

            if (string.IsNullOrWhiteSpace(email))
            {
                TempData["Error"] = "Debes ingresar un email.";
                return RedirectToAction(nameof(Alumnos), new { id = claseId });
            }

            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == email);
            if (usuario == null)
            {
                TempData["Error"] = "No existe un usuario con ese email.";
                return RedirectToAction(nameof(Alumnos), new { id = claseId });
            }

            var ya = await _context.UsuarioClases.AnyAsync(uc => uc.ClaseId == claseId && uc.UsuarioId == usuario.Id);
            if (ya)
            {
                TempData["Error"] = "El usuario ya está vinculado a la clase.";
                return RedirectToAction(nameof(Alumnos), new { id = claseId });
            }

            _context.UsuarioClases.Add(new UsuarioClase
            {
                ClaseId = claseId,
                UsuarioId = usuario.Id,
                Rol = string.IsNullOrWhiteSpace(rol) ? "Estudiante" : rol,
                Estado = "Invitado",
                FechaUnion = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();
            TempData["Success"] = "Invitación enviada.";
            return RedirectToAction(nameof(Alumnos), new { id = claseId });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [RolFilter("Profesor")]
        public async Task<IActionResult> CambiarRol(int usuarioClaseId, string rol)
        {
            var uc = await _context.UsuarioClases.Include(x => x.Clase).FirstOrDefaultAsync(x => x.Id == usuarioClaseId);
            if (uc == null) return NotFound();
            if (uc.Clase!.ProfesorId != HttpContext.Session.GetInt32("UsuarioId")) return RedirectToAction("AccesoDenegado", "Home");
            uc.Rol = string.IsNullOrWhiteSpace(rol) ? "Estudiante" : rol;
            await _context.SaveChangesAsync();
            TempData["Success"] = "Rol actualizado.";
            return RedirectToAction(nameof(Alumnos), new { id = uc.ClaseId });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [RolFilter("Profesor")]
        public async Task<IActionResult> QuitarAlumno(int usuarioClaseId)
        {
            var uc = await _context.UsuarioClases.Include(x => x.Clase).FirstOrDefaultAsync(x => x.Id == usuarioClaseId);
            if (uc == null) return NotFound();
            if (uc.Clase!.ProfesorId != HttpContext.Session.GetInt32("UsuarioId")) return RedirectToAction("AccesoDenegado", "Home");
            _context.UsuarioClases.Remove(uc);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Alumno eliminado de la clase.";
            return RedirectToAction(nameof(Alumnos), new { id = uc.ClaseId });
        }

        // Estudiante solicita unirse
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> SolicitarUnirse(int claseId)
        {
            var uid = HttpContext.Session.GetInt32("UsuarioId");
            if (uid == null) return RedirectToAction("Login", "Auth");
            var existe = await _context.UsuarioClases.FirstOrDefaultAsync(uc => uc.ClaseId == claseId && uc.UsuarioId == uid);
            if (existe != null)
            {
                if (existe.Estado == "Rechazado") existe.Estado = "Solicitado";
            }
            else
            {
                _context.UsuarioClases.Add(new UsuarioClase { ClaseId = claseId, UsuarioId = uid.Value, Estado = "Solicitado", Rol = "Estudiante", FechaUnion = DateTime.UtcNow });
            }
            await _context.SaveChangesAsync();
            TempData["Success"] = "Solicitud enviada.";
            return RedirectToAction("Details", new { id = claseId });
        }

        // Profesor acepta/rechaza
        [HttpPost]
        [ValidateAntiForgeryToken]
        [RolFilter("Profesor")]
        public async Task<IActionResult> AceptarInvitacion(int usuarioClaseId)
        {
            var uc = await _context.UsuarioClases.Include(x => x.Clase).FirstOrDefaultAsync(x => x.Id == usuarioClaseId);
            if (uc == null) return NotFound();
            if (uc.Clase!.ProfesorId != HttpContext.Session.GetInt32("UsuarioId")) return RedirectToAction("AccesoDenegado", "Home");
            uc.Estado = "Aceptado";
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Alumnos), new { id = uc.ClaseId });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [RolFilter("Profesor")]
        public async Task<IActionResult> RechazarInvitacion(int usuarioClaseId)
        {
            var uc = await _context.UsuarioClases.Include(x => x.Clase).FirstOrDefaultAsync(x => x.Id == usuarioClaseId);
            if (uc == null) return NotFound();
            if (uc.Clase!.ProfesorId != HttpContext.Session.GetInt32("UsuarioId")) return RedirectToAction("AccesoDenegado", "Home");
            uc.Estado = "Rechazado";
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Alumnos), new { id = uc.ClaseId });
        }
    }
}

