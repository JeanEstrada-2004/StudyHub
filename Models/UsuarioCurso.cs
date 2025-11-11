using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace StudyHub.Models
{
    public class UsuarioCurso
    {
        public int Id { get; set; }
        public DateTime FechaUnion { get; set; } = DateTime.UtcNow;
        public string Rol { get; set; } = "Estudiante";
        public string Estado { get; set; } = "Aceptado";

        public int UsuarioId { get; set; }
        [ValidateNever]
        public virtual Usuario? Usuario { get; set; }

        public int CursoId { get; set; }
        [ValidateNever]
        public virtual Curso? Curso { get; set; }
    }
}

