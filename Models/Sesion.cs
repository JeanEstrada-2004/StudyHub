using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace StudyHub.Models
{
    public class Sesion
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "El título de la sesión es obligatorio")]
        [StringLength(100, ErrorMessage = "El título no puede tener más de 100 caracteres")]
        public string Titulo { get; set; }

        [StringLength(500, ErrorMessage = "La descripción no puede tener más de 500 caracteres")]
        public string? Descripcion { get; set; }

        [Required(ErrorMessage = "La fecha y hora son obligatorias")]
        [FutureDate(ErrorMessage = "La fecha y hora deben ser futuras")]
        public DateTime FechaHora { get; set; }

        [Range(15, 480, ErrorMessage = "La duración debe estar entre 15 y 480 minutos")]
        public int DuracionMinutos { get; set; } = 60;

        [StringLength(200, ErrorMessage = "La ubicación no puede tener más de 200 caracteres")]
        public string? Ubicacion { get; set; }

        [Url(ErrorMessage = "El enlace de reunión debe ser una URL válida")]
        public string? EnlaceReunion { get; set; }

        public int ClaseId { get; set; }
        [ValidateNever]
        public virtual Clase? Clase { get; set; }
    }
}
