namespace Ditso.Application.DTOs.Reports;

/// <summary>Gasto total por categoría dentro de un período.</summary>
public class CategoryReportItemDto
{
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryIcon { get; set; } = string.Empty;
    public decimal TotalExpense { get; set; }
    public decimal Percentage { get; set; }
}

/// <summary>Respuesta completa del reporte de período.</summary>
public class PeriodReportDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalIncome { get; set; }
    public decimal TotalExpense { get; set; }
    public decimal Balance { get; set; }
    public decimal SavingsRate { get; set; }   // % del ingreso que se ahorró
    public List<CategoryReportItemDto> ByCategory { get; set; } = new();
}

/// <summary>Punto de datos mensual para la gráfica de evolución anual.</summary>
public class MonthlyDataPointDto
{
    public int Month { get; set; }         // 1-12
    public string MonthName { get; set; } = string.Empty;
    public decimal TotalExpense { get; set; }
    public decimal TotalIncome { get; set; }
    public decimal Balance { get; set; }
}
