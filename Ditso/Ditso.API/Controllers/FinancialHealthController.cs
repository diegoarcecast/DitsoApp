using Ditso.Application.DTOs.FinancialHealth;
using Ditso.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Ditso.API.Controllers;

[ApiController]
[Route("api/financial-health")]
[Authorize]
public class FinancialHealthController : ControllerBase
{
    private readonly IFinancialHealthService _service;

    public FinancialHealthController(IFinancialHealthService service)
    {
        _service = service;
    }

    /// <summary>
    /// Retorna el estado de salud financiera del usuario para el período indicado.
    /// Si no se envían fechas, calcula la quincena actual automáticamente.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<FinancialHealthDto>> GetHealth(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var (start, end) = ResolveDates(startDate, endDate);

        var result = await _service.GetHealthAsync(userId, start, end);
        return Ok(result);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /// <summary>Si no se pasan fechas, devuelve la quincena actual según el día de hoy.</summary>
    private static (DateTime start, DateTime end) ResolveDates(DateTime? startDate, DateTime? endDate)
    {
        if (startDate.HasValue && endDate.HasValue)
            return (startDate.Value, endDate.Value);

        var today = DateTime.Today;

        // Primera quincena: día 1–15 | Segunda quincena: día 16–fin de mes
        DateTime start, end;
        if (today.Day <= 15)
        {
            start = new DateTime(today.Year, today.Month, 1);
            end   = new DateTime(today.Year, today.Month, 15);
        }
        else
        {
            start = new DateTime(today.Year, today.Month, 16);
            end   = new DateTime(today.Year, today.Month,
                        DateTime.DaysInMonth(today.Year, today.Month));
        }

        return (start, end);
    }
}
