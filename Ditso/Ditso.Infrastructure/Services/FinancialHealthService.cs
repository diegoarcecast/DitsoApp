using Ditso.Application.DTOs.FinancialHealth;
using Ditso.Application.Interfaces;
using Ditso.Domain.Enums;
using Ditso.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Ditso.Infrastructure.Services;

public class FinancialHealthService : IFinancialHealthService
{
    private readonly DitsoDbContext _db;

    public FinancialHealthService(DitsoDbContext db)
    {
        _db = db;
    }

    public async Task<FinancialHealthDto> GetHealthAsync(int userId, DateTime startDate, DateTime endDate)
    {
        // Normalizar al inicio y fin del día para incluir todo el rango
        var start = startDate.Date;
        var end = endDate.Date.AddDays(1).AddTicks(-1);

        var transactions = await _db.Transactions
            .Where(t => t.UserId == userId
                     && !t.IsDeleted
                     && t.Date >= start
                     && t.Date <= end)
            .ToListAsync();

        var totalIncome = transactions
            .Where(t => t.Type == TransactionType.Income)
            .Sum(t => t.Amount);

        var totalExpense = transactions
            .Where(t => t.Type == TransactionType.Expense)
            .Sum(t => t.Amount);

        return Classify(totalIncome, totalExpense, start, endDate.Date);
    }

    // ─── Lógica del semáforo ───────────────────────────────────────────────────

    private static FinancialHealthDto Classify(
        decimal totalIncome,
        decimal totalExpense,
        DateTime startDate,
        DateTime endDate)
    {
        var balance = totalIncome - totalExpense;
        var expensePct = totalIncome > 0
            ? (totalExpense / totalIncome) * 100m
            : (totalExpense > 0 ? 100m : 0m);

        string status, color, emoji, message;

        if (totalIncome == 0 && totalExpense == 0)
        {
            status  = "Sin datos";
            color   = "gray";
            emoji   = "⚪";
            message = "No hay transacciones en este período. ¡Registra tus ingresos y gastos para ver tu balance!";
        }
        else if (totalIncome == 0 || balance < 0 || expensePct > 90)
        {
            status  = "Peligro";
            color   = "red";
            emoji   = "🔴";
            message = totalIncome == 0
                ? "Aún no tienes ingresos registrados en este período. Registra tus ingresos para ver tu balance real."
                : "Tus gastos superan el 90% de tus ingresos. Intenta reducir gastos no esenciales lo antes posible.";
        }
        else if (expensePct >= 71)
        {
            status  = "Riesgo";
            color   = "yellow";
            emoji   = "🟡";
            message = "Tus gastos están entre el 71% y 90% de tus ingresos. Considera revisar tu presupuesto para este período.";
        }
        else
        {
            status  = "Saludable";
            color   = "green";
            emoji   = "🟢";
            message = "¡Bien hecho! Tus gastos están por debajo del 70% de tus ingresos. Considera ahorrar el excedente.";
        }

        return new FinancialHealthDto
        {
            StartDate          = startDate,
            EndDate            = endDate,
            TotalIncome        = totalIncome,
            TotalExpense       = totalExpense,
            Balance            = balance,
            ExpensePercentage  = Math.Round(expensePct, 1),
            HealthStatus       = status,
            StatusColor        = color,
            StatusEmoji        = emoji,
            EducationalMessage = message,
        };
    }
}
