// Comportamiento mínimo para Mis Invitaciones (confirmaciones)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form[asp-action] button[type="submit"]').forEach(btn => {
    btn.addEventListener('click', e => {
      const act = btn.closest('form')?.getAttribute('asp-action') || '';
      if (act.toLowerCase().includes('rechazar') && !confirm('¿Rechazar invitación?')) {
        e.preventDefault();
      }
    });
  });
});

