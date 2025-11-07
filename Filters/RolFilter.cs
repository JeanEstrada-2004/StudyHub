using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Http;

namespace StudyHub.Filters
{
    public class RolFilter : Attribute, IActionFilter
    {
        private readonly string _rolRequerido;

        public RolFilter(string rolRequerido)
        {
            _rolRequerido = rolRequerido;
        }

        public void OnActionExecuting(ActionExecutingContext context)
        {
            var usuarioRol = context.HttpContext.Session.GetString("UsuarioRol");
            if (usuarioRol != _rolRequerido)
            {
                context.Result = new RedirectToActionResult("AccesoDenegado", "Home", null);
            }
        }

        public void OnActionExecuted(ActionExecutedContext context) { }
    }
}

