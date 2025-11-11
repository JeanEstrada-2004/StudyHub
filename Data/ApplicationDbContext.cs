using Microsoft.EntityFrameworkCore;
using StudyHub.Models;

namespace StudyHub.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Curso> Cursos { get; set; }
        public DbSet<Clase> Clases { get; set; }
        public DbSet<UsuarioCurso> UsuarioCursos { get; set; }
        public DbSet<Sesion> Sesiones { get; set; }
        public DbSet<Recurso> Recursos { get; set; }
        public DbSet<Mensaje> Mensajes { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Usuario
            builder.Entity<Usuario>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Curso
            builder.Entity<Curso>()
                .HasOne(c => c.Profesor)
                .WithMany()
                .HasForeignKey(c => c.ProfesorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Clase
            builder.Entity<Clase>()
                .HasOne(c => c.Profesor)
                .WithMany()
                .HasForeignKey(c => c.ProfesorId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Clase>()
                .HasOne(c => c.Curso)
                .WithMany(cu => cu.Clases)
                .HasForeignKey(c => c.CursoId)
                .OnDelete(DeleteBehavior.Restrict);

            // UsuarioCurso (pertenencia a curso)
            builder.Entity<UsuarioCurso>()
                .HasKey(uc => uc.Id);

            builder.Entity<UsuarioCurso>()
                .HasOne(uc => uc.Usuario)
                .WithMany(u => u.UsuarioCursos)
                .HasForeignKey(uc => uc.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<UsuarioCurso>()
                .HasOne(uc => uc.Curso)
                .WithMany(c => c.UsuarioCursos)
                .HasForeignKey(uc => uc.CursoId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<UsuarioCurso>()
                .Property(uc => uc.Estado)
                .HasDefaultValue("Aceptado");
        }
    }
}

