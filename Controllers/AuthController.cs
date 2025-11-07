using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.Data;
using StudyHub.Models;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;

namespace StudyHub.Controllers
{
    public class AuthController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AuthController> _logger;

        public AuthController(ApplicationDbContext context, ILogger<AuthController> logger)
        {
            _context = context;
            _logger = logger;
        }

        public IActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Login(string email, string password)
        {
            try
            {
                if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
                {
                    ViewBag.Error = "Email y contraseña son requeridos";
                    return View();
                }

                var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == email);

            if (usuario != null && VerifyPassword(password, usuario.PasswordHash))
            {
                HttpContext.Session.SetInt32("UsuarioId", usuario.Id);
                HttpContext.Session.SetString("UsuarioNombre", usuario.Nombre);
                HttpContext.Session.SetString("UsuarioRol", usuario.Rol);
                return RedirectToAction("Index", "Home");
            }

                ViewBag.Error = "Credenciales inválidas";
                return View();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error durante el login");
                ViewBag.Error = "Error durante el login. Por favor, intente nuevamente.";
                return View();
            }
        }

        public IActionResult Register()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Register(Usuario usuario, string password)
        {
            try
            {
                // Validar campos requeridos
                if (usuario == null || string.IsNullOrEmpty(usuario.Nombre) || string.IsNullOrEmpty(usuario.Email) || string.IsNullOrEmpty(password))
                {
                    ViewBag.Error = "Todos los campos son obligatorios";
                    return View();
                }

                // Validar formato de email
                if (!usuario.Email.Contains("@"))
                {
                    ViewBag.Error = "El formato del email no es válido";
                    return View();
                }

                // Verificar si el email ya existe
                if (await _context.Usuarios.AnyAsync(u => u.Email == usuario.Email))
                {
                    ViewBag.Error = "El email ya está registrado";
                    return View();
                }

                // Asignar valores por defecto si es necesario
                if (string.IsNullOrEmpty(usuario.Rol))
                {
                    usuario.Rol = "Estudiante";
                }

                usuario.PasswordHash = HashPassword(password);
                usuario.FechaRegistro = DateTime.UtcNow;

                _context.Usuarios.Add(usuario);
                await _context.SaveChangesAsync();

                TempData["Success"] = "Registro exitoso. Por favor, inicie sesión.";
                return RedirectToAction("Login");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error durante el registro");
                ViewBag.Error = "Error durante el registro. Por favor, intente nuevamente.";
                return View();
            }
        }

        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return RedirectToAction("Index", "Home");
        }

        private string HashPassword(string password)
        {
            try
            {
                byte[] salt = new byte[128 / 8];
                using (var rng = RandomNumberGenerator.Create())
                {
                    rng.GetBytes(salt);
                }

                string hashed = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                    password: password,
                    salt: salt,
                    prf: KeyDerivationPrf.HMACSHA256,
                    iterationCount: 10000,
                    numBytesRequested: 256 / 8));

                return $"{Convert.ToBase64String(salt)}.{hashed}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al hashear la contraseña");
                throw;
            }
        }

        private bool VerifyPassword(string password, string storedHash)
        {
            try
            {
                if (string.IsNullOrEmpty(storedHash) || !storedHash.Contains('.'))
                    return false;

                var parts = storedHash.Split('.');
                if (parts.Length != 2)
                    return false;

                var salt = Convert.FromBase64String(parts[0]);
                var hash = parts[1];

                string hashed = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                    password: password,
                    salt: salt,
                    prf: KeyDerivationPrf.HMACSHA256,
                    iterationCount: 10000,
                    numBytesRequested: 256 / 8));

                return hash == hashed;
            }
            catch
            {
                return false;
            }
        }
    }
}
