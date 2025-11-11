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
                var cursoIds = await _context.UsuarioCursos
                    .Where(uc => uc.UsuarioId == usuarioId && uc.Estado == "Aceptado")
                    .Select(uc => uc.CursoId)
                    .ToListAsync();

                clases = await _context.Clases
                    .Where(c => cursoIds.Contains(c.CursoId))
                    .OrderByDescending(c => c.FechaCreacion)
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

            bool tieneAcceso = false;
            if (usuarioRol == "Profesor")
                tieneAcceso = clase.ProfesorId == usuarioId;
            else
                tieneAcceso = await _context.UsuarioCursos.AnyAsync(uc => uc.UsuarioId == usuarioId && uc.CursoId == clase.CursoId && uc.Estado == "Aceptado");

            if (!tieneAcceso) return RedirectToAction("AccesoDenegado", "Home");

            return View(clase);
        }

        // GET: Clases/Create
        [RolFilter("Profesor")]
        public IActionResult Create(int? cursoId)
        {
            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            ViewBag.Cursos = new SelectList(_context.Cursos
                .Where(c => c.Activo && c.ProfesorId == usuarioId)
                .OrderBy(c => c.Nombre), nameof(Curso.Id), nameof(Curso.Nombre), cursoId);
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
                var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
                ViewBag.Cursos = new SelectList(_context.Cursos
                    .Where(c => c.Activo && c.ProfesorId == usuarioId)
                    .OrderBy(c => c.Nombre), nameof(Curso.Id), nameof(Curso.Nombre), clase.CursoId);
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
                var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
                ViewBag.Cursos = new SelectList(_context.Cursos
                    .Where(c => c.Activo && c.ProfesorId == usuarioId)
                    .OrderBy(c => c.Nombre), nameof(Curso.Id), nameof(Curso.Nombre), clase.CursoId);
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
            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            ViewBag.Cursos = new SelectList(_context.Cursos
                .Where(c => c.Activo && c.ProfesorId == usuarioId)
                .OrderBy(c => c.Nombre), nameof(Curso.Id), nameof(Curso.Nombre), clase.CursoId);
            return View(clase);
        }

        // POST: Clases/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        [RolFilter("Profesor")]
        public async Task<IActionResult> Edit(int id, [Bind("Id,Titulo,Descripcion,CursoId,EsPublica,MaxEstudiantes")] Clase clase)
        {
            if (id != clase.Id) return NotFound();
            var original = await _context.Clases.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
            if (original == null) return NotFound();
            if (original.ProfesorId != HttpContext.Session.GetInt32("UsuarioId")) return RedirectToAction("AccesoDenegado", "Home");

            try
            {
                clase.ProfesorId = original.ProfesorId;
                _context.Update(clase);
                await _context.SaveChangesAsync();
                TempData["Success"] = "Clase actualizada exitosamente.";
                return RedirectToAction(nameof(Index));
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Clases.AnyAsync(e => e.Id == id))
                    return NotFound();
                throw;
            }
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
    }
}
