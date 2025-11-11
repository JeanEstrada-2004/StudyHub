using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace StudyHub.Models
{
    public class Clase
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "El título es obligatorio")]
        [StringLength(100, ErrorMessage = "El título no puede tener más de 100 caracteres")]
        public string Titulo { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "La descripción no puede tener más de 500 caracteres")]
        public string Descripcion { get; set; } = string.Empty;

        // Nuevo: Curso (reemplaza Materia)
        [Required]
        public int CursoId { get; set; }
        [ValidateNever]
        public virtual Curso Curso { get; set; } = null!;

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public bool EsPublica { get; set; } = true;

        [Range(1, 100, ErrorMessage = "El número máximo de estudiantes debe estar entre 1 y 100")]
        public int? MaxEstudiantes { get; set; } = 20;

        // Claves foráneas
        public int ProfesorId { get; set; }

        [ValidateNever]
        public virtual Usuario Profesor { get; set; } = null!;

        // Navegación
        [ValidateNever]
        public virtual ICollection<Sesion> Sesiones { get; set; } = new List<Sesion>();
        
        [ValidateNever]
        public virtual ICollection<Recurso> Recursos { get; set; } = new List<Recurso>();
        
        [ValidateNever]
        public virtual ICollection<Mensaje> Mensajes { get; set; } = new List<Mensaje>();
    }
}
