using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using System.Net;

namespace StudyHub.Filters
{
    public class GlobalExceptionFilter : IExceptionFilter
    {
        private readonly ILogger<GlobalExceptionFilter> _logger;
        private readonly IWebHostEnvironment _env;

        public GlobalExceptionFilter(ILogger<GlobalExceptionFilter> logger, IWebHostEnvironment env)
        {
            _logger = logger;
            _env = env;
        }

        public void OnException(ExceptionContext context)
        {
            _logger.LogError(context.Exception, "Error no controlado en la aplicación");

            // Crear ViewData manualmente
            var viewData = new ViewDataDictionary(new Microsoft.AspNetCore.Mvc.ModelBinding.EmptyModelMetadataProvider(), context.ModelState);
            
            if (_env.IsDevelopment())
            {
                viewData["ErrorMessage"] = context.Exception.Message;
                viewData["StackTrace"] = context.Exception.StackTrace;
            }
            else
            {
                viewData["ErrorMessage"] = "Ha ocurrido un error inesperado. Por favor, intente más tarde.";
                viewData["StackTrace"] = null;
            }

            var result = new ViewResult
            {
                ViewName = "Error",
                StatusCode = (int)HttpStatusCode.InternalServerError,
                ViewData = viewData
            };

            context.Result = result;
            context.ExceptionHandled = true;
        }
    }
}