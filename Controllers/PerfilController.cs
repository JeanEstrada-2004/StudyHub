using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.Data;
using StudyHub.Filters;
using StudyHub.Models;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;

namespace StudyHub.Controllers
{
    [AutorizacionFilter]
    public class PerfilController : Controller
    {
        private readonly ApplicationDbContext _context;

        public PerfilController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Perfil
        public async Task<IActionResult> Index()
        {
            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            var usuario = await _context.Usuarios.FindAsync(usuarioId);

            if (usuario == null)
            {
                return RedirectToAction("Logout", "Auth");
            }

            return View(usuario);
        }

        // GET: Perfil/Edit
        public async Task<IActionResult> Edit()
        {
            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            var usuario = await _context.Usuarios.FindAsync(usuarioId);

            if (usuario == null)
            {
                return RedirectToAction("Logout", "Auth");
            }

            return View(usuario);
        }

        // POST: Perfil/Edit
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit([Bind("Id,Nombre,Email,Rol")] Usuario usuarioActualizado)
        {
            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            if (usuarioId != usuarioActualizado.Id)
            {
                return RedirectToAction("AccesoDenegado", "Home");
            }

            if (ModelState.IsValid)
            {
                var usuario = await _context.Usuarios.FindAsync(usuarioId);
                if (usuario == null)
                {
                    return RedirectToAction("Logout", "Auth");
                }

                if (await _context.Usuarios.AnyAsync(u => u.Email == usuarioActualizado.Email && u.Id != usuarioId))
                {
                    ModelState.AddModelError("Email", "El email ya estÃ¡ en uso por otro usuario.");
                    return View(usuarioActualizado);
                }

                usuario.Nombre = usuarioActualizado.Nombre;
                usuario.Email = usuarioActualizado.Email;
                usuario.Rol = usuarioActualizado.Rol;

                _context.Update(usuario);
                await _context.SaveChangesAsync();

                HttpContext.Session.SetString("UsuarioNombre", usuario.Nombre);
                HttpContext.Session.SetString("UsuarioRol", usuario.Rol);

                TempData["Success"] = "Perfil actualizado exitosamente.";
                return RedirectToAction(nameof(Index));
            }

            return View(usuarioActualizado);
        }

        // GET: Perfil/CambiarPassword
        public IActionResult CambiarPassword()
        {
            return View();
        }

        // POST: Perfil/CambiarPassword
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CambiarPassword(string passwordActual, string nuevaPassword)
        {
            var usuarioId = HttpContext.Session.GetInt32("UsuarioId");
            var usuario = await _context.Usuarios.FindAsync(usuarioId);

            if (usuario == null)
            {
                return RedirectToAction("Logout", "Auth");
            }

            if (string.IsNullOrWhiteSpace(nuevaPassword) || nuevaPassword.Length < 6)
            {
                ModelState.AddModelError("NuevaPassword", "La nueva contraseÃ±a debe tener al menos 6 caracteres.");
                ViewData["ErrorNuevaPassword"] = "La nueva contraseÃ±a debe tener al menos 6 caracteres.";
                return View();
            }

            if (!VerifyPassword(passwordActual, usuario.PasswordHash))
            {
                ModelState.AddModelError("PasswordActual", "La contraseÃ±a actual es incorrecta.");
                ViewData["ErrorPasswordActual"] = "La contraseÃ±a actual es incorrecta.";
                return View();
            }

            usuario.PasswordHash = HashPassword(nuevaPassword);
            _context.Update(usuario);
            await _context.SaveChangesAsync();

            TempData["Success"] = "ContraseÃ±a cambiada exitosamente.";
            return RedirectToAction(nameof(Index));
        }

        private string HashPassword(string password)
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

        private bool VerifyPassword(string password, string storedHash)
        {
            try
            {
                var parts = storedHash.Split('.');
                if (parts.Length != 2) return false;

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
            catch { return false; }
        }
    }
}

