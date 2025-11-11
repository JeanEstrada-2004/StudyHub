using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.Data;
using StudyHub.Filters;
using StudyHub.Models;
using StudyHub.Helpers;

namespace StudyHub.Controllers
{
    [AutorizacionFilter]
    public class MensajesController : Controller
    {
        private readonly ApplicationDbContext _context;

        public MensajesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Mensajes/Index?claseId=5
        public async Task<IActionResult> Index(int claseId)
        {
            var mensajes = await _context.Mensajes
                .Where(m => m.ClaseId == claseId)
                .Include(m => m.Usuario)
                .OrderByDescending(m => m.FechaEnvio)
                .ToListAsync();

            var clase = await _context.Clases.FindAsync(claseId);
            ViewBag.Clase = clase;

            return View(mensajes);
        }

        // POST: Mensajes/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(int claseId, string contenido)
        {
            if (string.IsNullOrWhiteSpace(contenido))
            {
                TempData["Error"] = "El mensaje no puede estar vacío.";
                return RedirectToAction(nameof(Index), new { claseId });
            }

            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            if (usuarioId == null) return RedirectToAction("Login", "Auth");

            var usuarioRol = HttpContext.Session.GetString("UsuarioRol");
            var clase = await _context.Clases.FindAsync(claseId);
            var perteneceAClase = usuarioRol == "Profesor"
                ? clase != null && clase.ProfesorId == usuarioId
                : await _context.UsuarioCursos.AnyAsync(uc => uc.UsuarioId == usuarioId && uc.CursoId == clase!.CursoId && uc.Estado == "Aceptado");

            if (!perteneceAClase)
            {
                return RedirectToAction("AccesoDenegado", "Home");
            }

            var mensaje = new Mensaje
            {
                Contenido = SecurityHelper.SanitizeInput(contenido),
                ClaseId = claseId,
                UsuarioId = usuarioId.Value,
                FechaEnvio = DateTime.UtcNow
            };

            _context.Add(mensaje);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Mensaje publicado.";

            return RedirectToAction(nameof(Index), new { claseId });
        }

        // POST: Mensajes/Delete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int id)
        {
            var mensaje = await _context.Mensajes
                .Include(m => m.Clase)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (mensaje == null)
            {
                return NotFound();
            }

            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            var usuarioRol = HttpContext.Session.GetString("UsuarioRol");

            var puedeEliminar = mensaje.UsuarioId == usuarioId ||
                               (usuarioRol == "Profesor" && mensaje.Clase.ProfesorId == usuarioId);

            if (!puedeEliminar)
            {
                return RedirectToAction("AccesoDenegado", "Home");
            }

            _context.Mensajes.Remove(mensaje);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Mensaje eliminado.";

            return RedirectToAction(nameof(Index), new { claseId = mensaje.ClaseId });
        }
    }
}
