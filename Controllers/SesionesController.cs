using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc.Rendering;
using StudyHub.Data;
using StudyHub.Filters;
using StudyHub.Models;

namespace StudyHub.Controllers
{
    [AutorizacionFilter]
    public class SesionesController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SesionesController> _logger;

        public SesionesController(ApplicationDbContext context, ILogger<SesionesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: Sesiones/Calendario
        public async Task<IActionResult> Calendario()
        {
            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            var usuarioRol = HttpContext.Session.GetString("UsuarioRol");

            List<Sesion> sesiones = new List<Sesion>();

            if (usuarioRol == "Profesor")
            {
                sesiones = await _context.Sesiones
                    .Where(s => s.Clase.ProfesorId == usuarioId)
                    .Include(s => s.Clase)
                    .OrderBy(s => s.FechaHora)
                    .ToListAsync();
            }
            else
            {
                var cursoIds = await _context.UsuarioCursos
                    .Where(uc => uc.UsuarioId == usuarioId && uc.Estado == "Aceptado")
                    .Select(uc => uc.CursoId)
                    .ToListAsync();

                sesiones = await _context.Sesiones
                    .Where(s => cursoIds.Contains(s.Clase.CursoId))
                    .Include(s => s.Clase)
                    .OrderBy(s => s.FechaHora)
                    .ToListAsync();
            }

            return View(sesiones);
        }

        // GET: Sesiones/Create
        [RolFilter("Profesor")]
        public async Task<IActionResult> Create()
        {
            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            var clases = await _context.Clases
                .Where(c => c.ProfesorId == usuarioId)
                .ToListAsync();

            ViewBag.Clases = new SelectList(clases, nameof(Clase.Id), nameof(Clase.Titulo));
            return View();
        }

        // POST: Sesiones/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        [RolFilter("Profesor")]
        public async Task<IActionResult> Create([Bind("Titulo,Descripcion,FechaHora,DuracionMinutos,Ubicacion,EnlaceReunion,ClaseId")] Sesion sesion)
        {
            // Validación según tipo de sesión (virtual / presencial)
            var tipoSesion = Request.Form["TipoSesion"].ToString();
            if (string.Equals(tipoSesion, "Virtual", StringComparison.OrdinalIgnoreCase))
            {
                if (string.IsNullOrWhiteSpace(sesion.EnlaceReunion))
                {
                    ModelState.AddModelError(nameof(Sesion.EnlaceReunion), "Para sesiones virtuales debes ingresar el enlace de reunión.");
                }
            }
            else // Presencial por defecto
            {
                if (string.IsNullOrWhiteSpace(sesion.Ubicacion))
                {
                    ModelState.AddModelError(nameof(Sesion.Ubicacion), "Para sesiones presenciales debes indicar la ubicación.");
                }

                if (string.IsNullOrWhiteSpace(sesion.EnlaceReunion))
                {
                    sesion.EnlaceReunion = null;
                }
            }

            if (ModelState.IsValid)
            {
                try
                {
                    var clase = await _context.Clases
                        .FirstOrDefaultAsync(c => c.Id == sesion.ClaseId && c.ProfesorId == HttpContext.Session.GetInt32("UsuarioId"));

                    if (clase == null)
                    {
                        TempData["Error"] = "No tienes permisos para crear sesiones en esta clase.";
                        return RedirectToAction("AccesoDenegado", "Home");
                    }

                    // CORRECCIÓN CRÍTICA: Manejar la conversión de fecha/hora
                    if (sesion.FechaHora.Kind == DateTimeKind.Local)
                    {
                        sesion.FechaHora = sesion.FechaHora.ToUniversalTime();
                    }
                    else if (sesion.FechaHora.Kind == DateTimeKind.Unspecified)
                    {
                        // Asumir que es local y convertir a UTC
                        sesion.FechaHora = DateTime.SpecifyKind(sesion.FechaHora, DateTimeKind.Local).ToUniversalTime();
                    }

                    _context.Add(sesion);
                    await _context.SaveChangesAsync();
                    
                    TempData["Success"] = "Sesión creada exitosamente.";
                    return RedirectToAction(nameof(Calendario));
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error al crear sesión");
                    TempData["Error"] = "Error al crear la sesión. Por favor, intente nuevamente.";
                }
            }
            else
            {
                _logger.LogWarning("ModelState inválido. Errores: {Errors}", 
                    string.Join("; ", ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)));
                TempData["Error"] = "Por favor, complete todos los campos requeridos correctamente.";
            }

            // Recargar ViewBag si hay error
            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            var clases = await _context.Clases
                .Where(c => c.ProfesorId == usuarioId)
                .ToListAsync();

            ViewBag.Clases = new SelectList(clases, nameof(Clase.Id), nameof(Clase.Titulo), sesion.ClaseId);
            return View(sesion);
        }

        // GET: Sesiones/Edit/5
        [RolFilter("Profesor")]
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var sesion = await _context.Sesiones
                .Include(s => s.Clase)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (sesion == null)
            {
                return NotFound();
            }

            if (sesion.Clase.ProfesorId != HttpContext.Session.GetInt32("UsuarioId"))
            {
                return RedirectToAction("AccesoDenegado", "Home");
            }

            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            var clases = await _context.Clases
                .Where(c => c.ProfesorId == usuarioId)
                .ToListAsync();

            ViewBag.Clases = new SelectList(clases, nameof(Clase.Id), nameof(Clase.Titulo), sesion.ClaseId);
            return View(sesion);
        }

        // POST: Sesiones/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        [RolFilter("Profesor")]
        public async Task<IActionResult> Edit(int id, [Bind("Id,Titulo,Descripcion,FechaHora,DuracionMinutos,Ubicacion,EnlaceReunion,ClaseId")] Sesion sesion)
        {
            if (id != sesion.Id)
            {
                return NotFound();
            }

            // Validación según tipo de sesión (virtual / presencial)
            var tipoSesion = Request.Form["TipoSesion"].ToString();
            if (string.Equals(tipoSesion, "Virtual", StringComparison.OrdinalIgnoreCase))
            {
                if (string.IsNullOrWhiteSpace(sesion.EnlaceReunion))
                {
                    ModelState.AddModelError(nameof(Sesion.EnlaceReunion), "Para sesiones virtuales debes ingresar el enlace de reunión.");
                }
            }
            else // Presencial por defecto
            {
                if (string.IsNullOrWhiteSpace(sesion.Ubicacion))
                {
                    ModelState.AddModelError(nameof(Sesion.Ubicacion), "Para sesiones presenciales debes indicar la ubicación.");
                }

                if (string.IsNullOrWhiteSpace(sesion.EnlaceReunion))
                {
                    sesion.EnlaceReunion = null;
                }
            }

            if (ModelState.IsValid)
            {
                try
                {
                    var clase = await _context.Clases
                        .FirstOrDefaultAsync(c => c.Id == sesion.ClaseId && c.ProfesorId == HttpContext.Session.GetInt32("UsuarioId"));

                    if (clase == null)
                    {
                        return RedirectToAction("AccesoDenegado", "Home");
                    }

                    _context.Update(sesion);
                    await _context.SaveChangesAsync();
                    TempData["Success"] = "Sesión actualizada exitosamente.";
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!SesionExists(sesion.Id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction(nameof(Calendario));
            }

            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            var clases = await _context.Clases
                .Where(c => c.ProfesorId == usuarioId)
                .ToListAsync();

            ViewBag.Clases = new SelectList(clases, nameof(Clase.Id), nameof(Clase.Titulo), sesion.ClaseId);
            return View(sesion);
        }

        // POST: Sesiones/Delete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        [RolFilter("Profesor")]
        public async Task<IActionResult> Delete(int id)
        {
            var sesion = await _context.Sesiones
                .Include(s => s.Clase)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (sesion == null)
            {
                return NotFound();
            }

            if (sesion.Clase.ProfesorId != HttpContext.Session.GetInt32("UsuarioId"))
            {
                return RedirectToAction("AccesoDenegado", "Home");
            }

            _context.Sesiones.Remove(sesion);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Sesión eliminada exitosamente.";

            return RedirectToAction(nameof(Calendario));
        }

        private bool SesionExists(int id)
        {
            return _context.Sesiones.Any(e => e.Id == id);
        }
    }
}
