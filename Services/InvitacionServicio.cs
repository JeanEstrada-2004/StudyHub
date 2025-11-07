using Microsoft.EntityFrameworkCore;
using StudyHub.Data;
using StudyHub.Models;

namespace StudyHub.Services
{
    public class InvitacionServicio
    {
        private readonly ApplicationDbContext _context;

        public InvitacionServicio(ApplicationDbContext context)
        {
            _context = context;
        }

        // Profesor invita a alumno a una clase
        public async Task<bool> InvitarEstudiante(int claseId, string email, string rol = "Estudiante")
        {
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == email);
            if (usuario == null) return false;
            var exists = await _context.UsuarioClases.AnyAsync(uc => uc.ClaseId == claseId && uc.UsuarioId == usuario.Id);
            if (exists) return false;
            _context.UsuarioClases.Add(new UsuarioClase
            {
                ClaseId = claseId,
                UsuarioId = usuario.Id,
                Rol = string.IsNullOrWhiteSpace(rol) ? "Estudiante" : rol,
                Estado = "Invitado",
                FechaUnion = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();
            return true;
        }

        // Estudiante solicita unirse a una clase pública
        public async Task<bool> SolicitarUnirse(int claseId, int usuarioId)
        {
            var exists = await _context.UsuarioClases.FirstOrDefaultAsync(uc => uc.ClaseId == claseId && uc.UsuarioId == usuarioId);
            if (exists != null)
            {
                if (exists.Estado == "Rechazado") exists.Estado = "Solicitado"; else return false;
            }
            else
            {
                _context.UsuarioClases.Add(new UsuarioClase
                {
                    ClaseId = claseId,
                    UsuarioId = usuarioId,
                    Rol = "Estudiante",
                    Estado = "Solicitado",
                    FechaUnion = DateTime.UtcNow
                });
            }
            await _context.SaveChangesAsync();
            return true;
        }

        // Profesor acepta/rechaza
        public async Task<bool> AceptarInvitacion(int usuarioClaseId)
        {
            var uc = await _context.UsuarioClases.FindAsync(usuarioClaseId);
            if (uc == null) return false;
            uc.Estado = "Aceptado";
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RechazarInvitacion(int usuarioClaseId)
        {
            var uc = await _context.UsuarioClases.FindAsync(usuarioClaseId);
            if (uc == null) return false;
            uc.Estado = "Rechazado";
            await _context.SaveChangesAsync();
            return true;
        }

        // Estudiante acepta/rechaza su invitación
        public async Task<bool> EstudianteAceptar(int usuarioClaseId, int usuarioId)
        {
            var uc = await _context.UsuarioClases.FirstOrDefaultAsync(x => x.Id == usuarioClaseId && x.UsuarioId == usuarioId);
            if (uc == null || uc.Estado != "Invitado") return false;
            uc.Estado = "Aceptado";
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> EstudianteRechazar(int usuarioClaseId, int usuarioId)
        {
            var uc = await _context.UsuarioClases.FirstOrDefaultAsync(x => x.Id == usuarioClaseId && x.UsuarioId == usuarioId);
            if (uc == null || uc.Estado != "Invitado") return false;
            uc.Estado = "Rechazado";
            await _context.SaveChangesAsync();
            return true;
        }

        // Clases disponibles para estudiante (públicas, donde no está ya inscrito o pendiente)
        public async Task<List<Clase>> ObtenerClasesDisponibles(int usuarioId)
        {
            var misClasesIds = await _context.UsuarioClases
                .Where(uc => uc.UsuarioId == usuarioId)
                .Select(uc => uc.ClaseId)
                .ToListAsync();

            return await _context.Clases
                .Where(c => c.EsPublica && !misClasesIds.Contains(c.Id))
                .OrderByDescending(c => c.FechaCreacion)
                .ToListAsync();
        }

        public async Task<List<UsuarioClase>> ObtenerInvitacionesPendientes(int usuarioId)
        {
            return await _context.UsuarioClases
                .Include(uc => uc.Clase)
                .Where(uc => uc.UsuarioId == usuarioId && uc.Estado == "Invitado")
                .OrderByDescending(uc => uc.FechaUnion)
                .ToListAsync();
        }
    }
}

