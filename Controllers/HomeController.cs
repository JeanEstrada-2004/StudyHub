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
                viewModel.MisClases = await _context.UsuarioClases
                    .Where(uc => uc.UsuarioId == usuarioId)
                    .Include(uc => uc.Clase)
                    .Select(uc => uc.Clase)
                    .ToListAsync();

                var claseIds = viewModel.MisClases.Select(c => c.Id);
                viewModel.ProximasSesiones = await _context.Sesiones
                    .Where(s => claseIds.Contains(s.ClaseId) && s.FechaHora > DateTime.UtcNow)
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
