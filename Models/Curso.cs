using System.ComponentModel.DataAnnotations;

namespace StudyHub.Models
{
    public class Curso
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Descripcion { get; set; }

        [Required]
        [StringLength(20)]
        public string Codigo { get; set; } = string.Empty;

        public bool Activo { get; set; } = true;

        public virtual ICollection<Clase> Clases { get; set; } = new List<Clase>();
    }
}

