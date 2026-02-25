using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ditso.Application.DTOs.Reports;
using Ditso.Application.Interfaces;
using System.Security.Claims;

namespace Ditso.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(IReportService reportService, ILogger<ReportsController> logger)
    {
        _reportService = reportService;
        _logger = logger;
    }

    /// <summary>
    /// Reporte de gastos por categoría en un período determinado.
    /// </summary>
    /// <param name="startDate">Fecha inicio (YYYY-MM-DD)</param>
    /// <param name="endDate">Fecha fin (YYYY-MM-DD)</param>
    [HttpGet("summary")]
    public async Task<ActionResult<PeriodReportDto>> GetSummary(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        try
        {
            if (startDate > endDate)
                return BadRequest(new { message = "La fecha de inicio no puede ser mayor que la fecha de fin." });

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var report = await _reportService.GetPeriodReportAsync(userId, startDate, endDate);
            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generando reporte de período");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Evolución mensual de ingresos y gastos para un año completo (12 puntos).
    /// </summary>
    /// <param name="year">Año (ej: 2025). Si no se especifica, usa el año actual.</param>
    [HttpGet("monthly")]
    public async Task<ActionResult<List<MonthlyDataPointDto>>> GetMonthly(
        [FromQuery] int? year)
    {
        try
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var targetYear = year ?? DateTime.UtcNow.Year;
            var data = await _reportService.GetMonthlyReportAsync(userId, targetYear);
            return Ok(data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generando reporte mensual");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }
}
