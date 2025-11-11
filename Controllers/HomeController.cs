using Microsoft.EntityFrameworkCore;
using StudyHub.Data;
using StudyHub.Filters;
using StudyHub.Models;
using Microsoft.AspNetCore.Mvc;
using StudyHub.Models.ViewModels;

namespace StudyHub.Controllers
{
    public class HomeController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<HomeController> _logger;

        public HomeController(ApplicationDbContext context, ILogger<HomeController> logger)
        {
            _context = context;
            _logger = logger;
        }

        public IActionResult Index()
        {
            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            if (usuarioId != null)
            {
                return RedirectToAction(nameof(Dashboard));
            }
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [AutorizacionFilter]
        public async Task<IActionResult> Dashboard()
        {
            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            var usuarioRol = HttpContext.Session.GetString("UsuarioRol");

            var viewModel = new DashboardViewModel
            {
                Usuario = await _context.Usuarios.FindAsync(usuarioId)
            };

            if (usuarioRol == "Profesor")
            {
                viewModel.MisCursos = await _context.Cursos
                    .Where(c => c.ProfesorId == usuarioId)
                    .OrderBy(c => c.Nombre)
                    .ToListAsync();

                viewModel.MisClases = await _context.Clases
                    .Where(c => c.ProfesorId == usuarioId)
                    .ToListAsync();

                viewModel.ProximasSesiones = await _context.Sesiones
                    .Where(s => s.Clase.ProfesorId == usuarioId && s.FechaHora > DateTime.UtcNow)
                    .OrderBy(s => s.FechaHora)
                    .Take(5)
                    .Include(s => s.Clase)
                    .ToListAsync();
            }
            else
            {
                var cursoIds = await _context.UsuarioCursos
                    .Where(uc => uc.UsuarioId == usuarioId && uc.Estado == "Aceptado")
                    .Select(uc => uc.CursoId)
                    .ToListAsync();

                viewModel.MisCursos = await _context.Cursos
                    .Where(c => cursoIds.Contains(c.Id))
                    .OrderBy(c => c.Nombre)
                    .ToListAsync();

                viewModel.MisClases = await _context.Clases
                    .Where(c => cursoIds.Contains(c.CursoId))
                    .ToListAsync();

                viewModel.ProximasSesiones = await _context.Sesiones
                    .Where(s => cursoIds.Contains(s.Clase.CursoId) && s.FechaHora > DateTime.UtcNow)
                    .OrderBy(s => s.FechaHora)
                    .Take(5)
                    .Include(s => s.Clase)
                    .ToListAsync();
            }

            return View(viewModel);
        }

        public IActionResult AccesoDenegado()
        {
            return View();
        }
    }
}
