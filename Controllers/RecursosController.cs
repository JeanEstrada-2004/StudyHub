using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using StudyHub.Data;
using StudyHub.Filters;
using StudyHub.Models;
using StudyHub.Helpers;

namespace StudyHub.Controllers
{
    [AutorizacionFilter]
    public class RecursosController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public RecursosController(ApplicationDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        // GET: Recursos?claseId=5
        public async Task<IActionResult> Index(int claseId)
        {
            var recursos = await _context.Recursos
                .Where(r => r.ClaseId == claseId)
                .Include(r => r.Usuario)
                .Include(r => r.Clase)
                .OrderByDescending(r => r.FechaSubida)
                .ToListAsync();

            var clase = await _context.Clases.FindAsync(claseId);
            if (clase == null)
            {
                return NotFound();
            }

            ViewBag.Clase = clase;

            return View(recursos);
        }

        // GET: Recursos/Create?claseId=5
        public async Task<IActionResult> Create(int claseId)
        {
            var clase = await _context.Clases.FindAsync(claseId);
            if (clase == null)
            {
                return NotFound();
            }

            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            var usuarioRol = HttpContext.Session.GetString("UsuarioRol");

            var perteneceAClase = usuarioRol == "Profesor"
                ? clase.ProfesorId == usuarioId
                : await _context.UsuarioCursos.AnyAsync(uc => uc.UsuarioId == usuarioId && uc.CursoId == clase.CursoId && uc.Estado == "Aceptado");

            if (!perteneceAClase)
            {
                return RedirectToAction("AccesoDenegado", "Home");
            }

            ViewBag.Clase = clase;
            var recurso = new Recurso { ClaseId = claseId };
            return View(recurso);
        }

        // POST: Recursos/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Titulo,Descripcion,Tipo,ClaseId")] Recurso recurso, IFormFile? archivo, string? url)
        {
            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            if (usuarioId == null) return RedirectToAction("Login", "Auth");
            recurso.UsuarioId = usuarioId.Value;

            if (ModelState.IsValid)
            {
                var clase = await _context.Clases.FindAsync(recurso.ClaseId);
                if (clase == null) return NotFound();

                var usuarioRol = HttpContext.Session.GetString("UsuarioRol");
                var perteneceAClase = usuarioRol == "Profesor"
                    ? clase.ProfesorId == usuarioId
                    : await _context.UsuarioCursos.AnyAsync(uc => uc.UsuarioId == usuarioId && uc.CursoId == clase.CursoId && uc.Estado == "Aceptado");

                if (!perteneceAClase)
                {
                    return RedirectToAction("AccesoDenegado", "Home");
                }

                // Sanitizar inputs
                recurso.Titulo = SecurityHelper.SanitizeInput(recurso.Titulo);
                recurso.Descripcion = SecurityHelper.SanitizeInput(recurso.Descripcion);

                if (string.Equals(recurso.Tipo, "Archivo", StringComparison.OrdinalIgnoreCase))
                {
                    if (archivo == null || archivo.Length == 0)
                    {
                        ModelState.AddModelError("archivo", "Debes adjuntar un archivo.");
                        ViewBag.Clase = clase;
                        return View(recurso);
                    }
                    var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
                    if (!Directory.Exists(uploadsFolder))
                    {
                        Directory.CreateDirectory(uploadsFolder);
                    }

                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(archivo.FileName);
                    var filePath = Path.Combine(uploadsFolder, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await archivo.CopyToAsync(stream);
                    }

                    recurso.NombreArchivo = archivo.FileName;
                    recurso.Url = $"/uploads/{fileName}";
                }
                else if (string.Equals(recurso.Tipo, "Enlace", StringComparison.OrdinalIgnoreCase))
                {
                    if (string.IsNullOrWhiteSpace(url))
                    {
                        ModelState.AddModelError("url", "Debes ingresar una URL válida.");
                        ViewBag.Clase = clase;
                        return View(recurso);
                    }
                    recurso.Url = SecurityHelper.SanitizeInput(url);
                    recurso.NombreArchivo = null;
                }
                else
                {
                    ModelState.AddModelError("Tipo", "Tipo de recurso inválido.");
                    ViewBag.Clase = clase;
                    return View(recurso);
                }

                _context.Add(recurso);
                await _context.SaveChangesAsync();
                TempData["Success"] = "Recurso creado exitosamente.";
                return RedirectToAction(nameof(Index), new { claseId = recurso.ClaseId });
            }

            var claseView = await _context.Clases.FindAsync(recurso.ClaseId);
            ViewBag.Clase = claseView;
            return View(recurso);
        }

        // POST: Recursos/Delete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int id)
        {
            var recurso = await _context.Recursos
                .Include(r => r.Clase)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (recurso == null)
            {
                return NotFound();
            }

            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            var usuarioRol = HttpContext.Session.GetString("UsuarioRol");

            var puedeEliminar = recurso.UsuarioId == usuarioId ||
                               (usuarioRol == "Profesor" && recurso.Clase.ProfesorId == usuarioId);

            if (!puedeEliminar)
            {
                return RedirectToAction("AccesoDenegado", "Home");
            }

            if (recurso.Tipo == "Archivo" && !string.IsNullOrEmpty(recurso.Url))
            {
                var filePath = Path.Combine(_environment.WebRootPath, recurso.Url.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }

            _context.Recursos.Remove(recurso);
            await _context.SaveChangesAsync();
            TempData["Success"] = "Recurso eliminado exitosamente.";

            return RedirectToAction(nameof(Index), new { claseId = recurso.ClaseId });
        }

        // GET: Recursos/Descargar/5
        public async Task<IActionResult> Descargar(int id)
        {
            var recurso = await _context.Recursos.FindAsync(id);
            if (recurso == null || recurso.Tipo != "Archivo")
            {
                return NotFound();
            }

            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            var usuarioRol = HttpContext.Session.GetString("UsuarioRol");

            var clase = await _context.Clases.FindAsync(recurso.ClaseId);
            var tieneAcceso = usuarioRol == "Profesor"
                ? clase?.ProfesorId == usuarioId
                : await _context.UsuarioCursos.AnyAsync(uc => uc.UsuarioId == usuarioId && uc.CursoId == clase!.CursoId && uc.Estado == "Aceptado");

            if (!tieneAcceso)
            {
                return RedirectToAction("AccesoDenegado", "Home");
            }

            var filePath = Path.Combine(_environment.WebRootPath, recurso.Url.TrimStart('/'));
            if (!System.IO.File.Exists(filePath))
            {
                return NotFound();
            }

            var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
            var downloadName = string.IsNullOrEmpty(recurso.NombreArchivo) ? Path.GetFileName(filePath) : recurso.NombreArchivo;
            return File(fileBytes, "application/octet-stream", downloadName);
        }
    }
}
