using Ditso.Application.DTOs.Reports;

namespace Ditso.Application.Interfaces;

public interface IReportService
{
    /// <summary>Reporte de gastos por categoría en un período.</summary>
    Task<PeriodReportDto> GetPeriodReportAsync(int userId, DateTime startDate, DateTime endDate);

    /// <summary>Evolución mensual de ingresos y gastos para un año completo.</summary>
    Task<List<MonthlyDataPointDto>> GetMonthlyReportAsync(int userId, int year);
}
