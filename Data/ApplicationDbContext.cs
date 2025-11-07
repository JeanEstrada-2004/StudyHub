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
        public DbSet<UsuarioClase> UsuarioClases { get; set; }
        public DbSet<Sesion> Sesiones { get; set; }
        public DbSet<Recurso> Recursos { get; set; }
        public DbSet<Mensaje> Mensajes { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<UsuarioClase>()
                .HasKey(uc => uc.Id);

            builder.Entity<UsuarioClase>()
                .HasOne(uc => uc.Usuario)
                .WithMany(u => u.UsuarioClases)
                .HasForeignKey(uc => uc.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<UsuarioClase>()
                .HasOne(uc => uc.Clase)
                .WithMany(c => c.UsuarioClases)
                .HasForeignKey(uc => uc.ClaseId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Usuario>()
                .HasIndex(u => u.Email)
                .IsUnique();

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

            // Estado por defecto para relaciones usuario-clase
            builder.Entity<UsuarioClase>()
                .Property(uc => uc.Estado)
                .HasDefaultValue("Aceptado");

            // Seed de cursos
            builder.Entity<Curso>().HasData(
                new Curso { Id = 1, Nombre = "Matemáticas", Codigo = "MAT101", Activo = true },
                new Curso { Id = 2, Nombre = "Programación", Codigo = "PRO101", Activo = true },
                new Curso { Id = 3, Nombre = "Bases de Datos", Codigo = "BD101", Activo = true },
                new Curso { Id = 4, Nombre = "Inteligencia Artificial", Codigo = "IA101", Activo = true }
            );
        }
    }
}
