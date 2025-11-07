using Microsoft.EntityFrameworkCore;
using StudyHub.Data;
using StudyHub.Models;

namespace StudyHub.Services
{
    public class CursoServicio
    {
        private readonly ApplicationDbContext _context;
        public CursoServicio(ApplicationDbContext context) { _context = context; }

        public Task<List<Curso>> ListarAsync() => _context.Cursos.OrderBy(c=>c.Nombre).ToListAsync();
        public Task<Curso?> ObtenerAsync(int id) => _context.Cursos.Include(c=>c.Clases).FirstOrDefaultAsync(c=>c.Id==id);
        public async Task CrearAsync(Curso curso){ _context.Cursos.Add(curso); await _context.SaveChangesAsync(); }
        public async Task EditarAsync(Curso curso){ _context.Cursos.Update(curso); await _context.SaveChangesAsync(); }
        public async Task EliminarAsync(int id){ var c = await _context.Cursos.FindAsync(id); if(c!=null){ _context.Cursos.Remove(c); await _context.SaveChangesAsync(); } }
    }
}

