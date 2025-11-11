namespace StudyHub.Models.ViewModels
{
    public class DashboardViewModel
    {
        public Usuario Usuario { get; set; }
        public List<Curso> MisCursos { get; set; } = new List<Curso>();
        public List<Clase> MisClases { get; set; } = new List<Clase>();
        public List<Sesion> ProximasSesiones { get; set; } = new List<Sesion>();
        public int TotalCursos => MisCursos.Count;
        public int TotalClases => MisClases.Count;
        public int ProximasSesionesCount => ProximasSesiones.Count;
    }
}
