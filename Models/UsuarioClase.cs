using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace StudyHub.Models
{
    public class UsuarioClase
    {
        public int Id { get; set; }
        public DateTime FechaUnion { get; set; } = DateTime.UtcNow;
        public string Rol { get; set; } = "Estudiante";
        public string Estado { get; set; } = "Aceptado";

        public int UsuarioId { get; set; }
        [ValidateNever]
        public virtual Usuario? Usuario { get; set; }

        public int ClaseId { get; set; }
        [ValidateNever]
        public virtual Clase? Clase { get; set; }
    }
}
