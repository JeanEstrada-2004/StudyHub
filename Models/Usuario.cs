using System.ComponentModel.DataAnnotations;

namespace StudyHub.Models
{
    public class Usuario
    {
        public int Id { get; set; }

        [Required]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public string Rol { get; set; } = "Estudiante";

        public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

        // Navegación
        public virtual ICollection<UsuarioCurso> UsuarioCursos { get; set; } = new List<UsuarioCurso>();
        public virtual ICollection<Recurso> Recursos { get; set; } = new List<Recurso>();
        public virtual ICollection<Mensaje> Mensajes { get; set; } = new List<Mensaje>();
    }
}

