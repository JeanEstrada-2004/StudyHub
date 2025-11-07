using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace StudyHub.Models
{
    public class Mensaje
    {
        public int Id { get; set; }

        [Required]
        public string Contenido { get; set; }

        public DateTime FechaEnvio { get; set; } = DateTime.UtcNow;

        public int ClaseId { get; set; }
        [ValidateNever]
        public virtual Clase? Clase { get; set; }

        public int UsuarioId { get; set; }
        [ValidateNever]
        public virtual Usuario? Usuario { get; set; }
    }
}
