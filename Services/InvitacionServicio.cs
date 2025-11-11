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

        // Profesor invita a estudiante a un curso
        public async Task<bool> InvitarEstudianteACurso(int cursoId, string email, string rol = "Estudiante")
        {
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == email);
            if (usuario == null) return false;
            var exists = await _context.UsuarioCursos.AnyAsync(uc => uc.CursoId == cursoId && uc.UsuarioId == usuario.Id);
            if (exists) return false;
            _context.UsuarioCursos.Add(new UsuarioCurso
            {
                CursoId = cursoId,
                UsuarioId = usuario.Id,
                Rol = string.IsNullOrWhiteSpace(rol) ? "Estudiante" : rol,
                Estado = "Invitado",
                FechaUnion = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();
            return true;
        }

        // Estudiante solicita unirse a un curso
        public async Task<bool> SolicitarUnirseACurso(int cursoId, int usuarioId)
        {
            var exists = await _context.UsuarioCursos.FirstOrDefaultAsync(uc => uc.CursoId == cursoId && uc.UsuarioId == usuarioId);
            if (exists != null)
            {
                if (exists.Estado == "Rechazado") exists.Estado = "Solicitado"; else return false;
            }
            else
            {
                _context.UsuarioCursos.Add(new UsuarioCurso
                {
                    CursoId = cursoId,
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
        public async Task<bool> AceptarInvitacion(int usuarioCursoId)
        {
            var uc = await _context.UsuarioCursos.FindAsync(usuarioCursoId);
            if (uc == null) return false;
            uc.Estado = "Aceptado";
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RechazarInvitacion(int usuarioCursoId)
        {
            var uc = await _context.UsuarioCursos.FindAsync(usuarioCursoId);
            if (uc == null) return false;
            uc.Estado = "Rechazado";
            await _context.SaveChangesAsync();
            return true;
        }

        // Estudiante acepta/rechaza su invitación
        public async Task<bool> EstudianteAceptar(int usuarioCursoId, int usuarioId)
        {
            var uc = await _context.UsuarioCursos.FirstOrDefaultAsync(x => x.Id == usuarioCursoId && x.UsuarioId == usuarioId);
            if (uc == null || uc.Estado != "Invitado") return false;
            uc.Estado = "Aceptado";
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> EstudianteRechazar(int usuarioCursoId, int usuarioId)
        {
            var uc = await _context.UsuarioCursos.FirstOrDefaultAsync(x => x.Id == usuarioCursoId && x.UsuarioId == usuarioId);
            if (uc == null || uc.Estado != "Invitado") return false;
            uc.Estado = "Rechazado";
            await _context.SaveChangesAsync();
            return true;
        }

        // Cursos disponibles para estudiante
        public async Task<List<Curso>> ObtenerCursosDisponibles(int usuarioId)
        {
            var misCursosIds = await _context.UsuarioCursos
                .Where(uc => uc.UsuarioId == usuarioId)
                .Select(uc => uc.CursoId)
                .ToListAsync();

            return await _context.Cursos
                .Where(c => c.Activo && !misCursosIds.Contains(c.Id))
                .Include(c => c.Profesor)
                .Include(c => c.UsuarioCursos)
                .Include(c => c.Clases)!
                    .ThenInclude(cl => cl.Sesiones)
                .OrderBy(c => c.Nombre)
                .ToListAsync();
        }

        public async Task<List<UsuarioCurso>> ObtenerInvitacionesPendientes(int usuarioId)
        {
            return await _context.UsuarioCursos
                .Include(uc => uc.Curso)!
                    .ThenInclude(c => c.Clases)
                .Include(uc => uc.Curso)!
                    .ThenInclude(c => c.UsuarioCursos)
                .Include(uc => uc.Curso)!
                    .ThenInclude(c => c.Profesor)
                .Where(uc => uc.UsuarioId == usuarioId && uc.Estado == "Invitado")
                .OrderByDescending(uc => uc.FechaUnion)
                .ToListAsync();
        }
    }
}
