namespace Ditso.Application.DTOs.FinancialHealth;

public class FinancialHealthDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    public decimal TotalIncome { get; set; }
    public decimal TotalExpense { get; set; }
    public decimal Balance { get; set; }

    /// <summary>Porcentaje de gasto respecto a los ingresos (0–100+)</summary>
    public decimal ExpensePercentage { get; set; }

    /// <summary>"Saludable", "Riesgo" o "Peligro"</summary>
    public string HealthStatus { get; set; } = string.Empty;

    /// <summary>"green", "yellow" o "red"</summary>
    public string StatusColor { get; set; } = string.Empty;

    /// <summary>🟢, 🟡 o 🔴</summary>
    public string StatusEmoji { get; set; } = string.Empty;

    public string EducationalMessage { get; set; } = string.Empty;
}
