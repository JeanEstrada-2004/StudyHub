using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace StudyHub.Models
{
    public class Recurso
    {
        public int Id { get; set; }

        [Required]
        public string Titulo { get; set; }

        public string? Descripcion { get; set; }

        [Required]
        public string Tipo { get; set; }

        public string? NombreArchivo { get; set; }

        public string? Url { get; set; }

        public DateTime FechaSubida { get; set; } = DateTime.UtcNow;

        public int ClaseId { get; set; }
        [ValidateNever]
        public virtual Clase? Clase { get; set; }

        public int UsuarioId { get; set; }
        [ValidateNever]
        public virtual Usuario? Usuario { get; set; }
    }
}
