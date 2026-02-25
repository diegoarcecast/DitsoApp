using Ditso.Application.DTOs.Reports;
using Ditso.Application.Interfaces;
using Ditso.Domain.Enums;
using Ditso.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Ditso.Infrastructure.Services;

public class ReportService : IReportService
{
    private readonly DitsoDbContext _db;

    private static readonly string[] MonthNames =
    [
        "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    public ReportService(DitsoDbContext db) => _db = db;

    // ── Reporte por período ─────────────────────────────────────────────────
    public async Task<PeriodReportDto> GetPeriodReportAsync(int userId, DateTime startDate, DateTime endDate)
    {
        var start = startDate.Date;
        var end   = endDate.Date.AddDays(1).AddTicks(-1);

        // Obtener todas las transacciones no eliminadas del período
        var transactions = await _db.Transactions
            .Include(t => t.Category)
            .Where(t => t.UserId == userId
                     && !t.IsDeleted
                     && t.Date >= start
                     && t.Date <= end)
            .ToListAsync();

        // Calcular totales
        var totalIncome  = transactions.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount);
        var totalExpense = transactions.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount);
        var balance      = totalIncome - totalExpense;
        var savingsRate  = totalIncome > 0 ? Math.Round((balance / totalIncome) * 100, 1) : 0m;

        // Agrupar gastos por categoría
        var byCategory = transactions
            .Where(t => t.Type == TransactionType.Expense)
            .GroupBy(t => new { t.CategoryId, t.Category!.Name, t.Category.Icon })
            .Select(g => new CategoryReportItemDto
            {
                CategoryName  = g.Key.Name,
                CategoryIcon  = g.Key.Icon,
                TotalExpense  = g.Sum(t => t.Amount),
                Percentage    = totalExpense > 0
                    ? Math.Round(g.Sum(t => t.Amount) / totalExpense * 100, 1)
                    : 0m
            })
            .OrderByDescending(c => c.TotalExpense)
            .ToList();

        return new PeriodReportDto
        {
            StartDate    = start,
            EndDate      = end,
            TotalIncome  = totalIncome,
            TotalExpense = totalExpense,
            Balance      = balance,
            SavingsRate  = savingsRate,
            ByCategory   = byCategory
        };
    }

    // ── Evolución mensual ───────────────────────────────────────────────────
    public async Task<List<MonthlyDataPointDto>> GetMonthlyReportAsync(int userId, int year)
    {
        var yearStart = new DateTime(year, 1, 1);
        var yearEnd   = new DateTime(year, 12, 31, 23, 59, 59);

        var transactions = await _db.Transactions
            .Where(t => t.UserId == userId
                     && !t.IsDeleted
                     && t.Date >= yearStart
                     && t.Date <= yearEnd)
            .ToListAsync();

        // Generar los 12 meses; si no hay datos el punto es 0
        var result = Enumerable.Range(1, 12).Select(month =>
        {
            var monthTx = transactions.Where(t => t.Date.Month == month).ToList();
            var income  = monthTx.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount);
            var expense = monthTx.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount);

            return new MonthlyDataPointDto
            {
                Month        = month,
                MonthName    = MonthNames[month],
                TotalIncome  = income,
                TotalExpense = expense,
                Balance      = income - expense
            };
        }).ToList();

        return result;
    }
}
