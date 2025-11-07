using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.Data;
using StudyHub.Models;
using StudyHub.Filters;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace StudyHub.Controllers
{
    [AutorizacionFilter]
    public class CursosController : Controller
    {
        private readonly ApplicationDbContext _context;

        public CursosController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var cursos = await _context.Cursos.OrderBy(c => c.Nombre).ToListAsync();
            return View(cursos);
        }

        [RolFilter("Profesor")]
        public IActionResult Create() => View(new Curso());

        [HttpPost]
        [ValidateAntiForgeryToken]
        [RolFilter("Profesor")]
        public async Task<IActionResult> Create(Curso curso)
        {
            if (!ModelState.IsValid) return View(curso);
            _context.Cursos.Add(curso);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        public async Task<IActionResult> Details(int id)
        {
            var curso = await _context.Cursos
                .Include(c => c.Clases)
                .FirstOrDefaultAsync(c => c.Id == id);
            if (curso == null) return NotFound();
            return View(curso);
        }

        [RolFilter("Profesor")]
        public async Task<IActionResult> Edit(int id)
        {
            var curso = await _context.Cursos.FindAsync(id);
            if (curso == null) return NotFound();
            return View(curso);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [RolFilter("Profesor")]
        public async Task<IActionResult> Edit(int id, Curso curso)
        {
            if (id != curso.Id) return NotFound();
            if (!ModelState.IsValid) return View(curso);
            _context.Update(curso);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        // DELETE
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

        // Gestión de alumnos por curso (agrega a una clase del curso)
        [RolFilter("Profesor")]
        public async Task<IActionResult> Alumnos(int id)
        {
            var curso = await _context.Cursos.Include(c => c.Clases).FirstOrDefaultAsync(c => c.Id == id);
            if (curso == null) return NotFound();

            var claseIds = curso.Clases.Select(c => c.Id).ToList();
            var alumnos = await _context.UsuarioClases
                .Where(uc => claseIds.Contains(uc.ClaseId))
                .Include(uc => uc.Usuario)
                .Include(uc => uc.Clase)
                .OrderBy(uc => uc.Clase!.Titulo).ThenBy(uc => uc.Usuario!.Nombre)
                .ToListAsync();

            ViewBag.Curso = curso;
            ViewBag.Clases = new SelectList(curso.Clases.OrderBy(c => c.Titulo), nameof(Clase.Id), nameof(Clase.Titulo));
            return View(alumnos);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [RolFilter("Profesor")]
        public async Task<IActionResult> InvitarAlumno(int cursoId, int claseId, string email, string rol = "Estudiante")
        {
            var curso = await _context.Cursos.Include(c => c.Clases).FirstOrDefaultAsync(c => c.Id == cursoId);
            if (curso == null) return NotFound();
            if (!curso.Clases.Any(c => c.Id == claseId)) { TempData["Error"] = "Clase inválida."; return RedirectToAction(nameof(Alumnos), new { id = cursoId }); }

            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == email);
            if (usuario == null) { TempData["Error"] = "Usuario no encontrado."; return RedirectToAction(nameof(Alumnos), new { id = cursoId }); }

            var ya = await _context.UsuarioClases.AnyAsync(uc => uc.ClaseId == claseId && uc.UsuarioId == usuario.Id);
            if (ya) { TempData["Error"] = "El usuario ya pertenece a la clase."; return RedirectToAction(nameof(Alumnos), new { id = cursoId }); }

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
            return RedirectToAction(nameof(Alumnos), new { id = cursoId });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [RolFilter("Profesor")]
        public async Task<IActionResult> Aceptar(int usuarioClaseId)
        {
            var uc = await _context.UsuarioClases.Include(x => x.Clase).ThenInclude(c=>c.Curso).FirstOrDefaultAsync(x => x.Id == usuarioClaseId);
            if (uc == null) return NotFound();
            uc.Estado = "Aceptado";
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Alumnos), new { id = uc.Clase!.CursoId });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [RolFilter("Profesor")]
        public async Task<IActionResult> Rechazar(int usuarioClaseId)
        {
            var uc = await _context.UsuarioClases.Include(x => x.Clase).ThenInclude(c=>c.Curso).FirstOrDefaultAsync(x => x.Id == usuarioClaseId);
            if (uc == null) return NotFound();
            uc.Estado = "Rechazado";
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Alumnos), new { id = uc.Clase!.CursoId });
        }
    }
}
