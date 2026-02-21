using Microsoft.EntityFrameworkCore;
using Ditso.Application.DTOs.Budgets;
using Ditso.Application.Interfaces;
using Ditso.Domain.Entities;
using Ditso.Domain.Enums;
using Ditso.Infrastructure.Data;

namespace Ditso.Infrastructure.Services;

public class BudgetService : IBudgetService
{
    private readonly DitsoDbContext _context;

    public BudgetService(DitsoDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<BudgetDto>> GetAllAsync(int userId)
    {
        var budgets = await _context.Budgets
            .Include(b => b.Items)
                .ThenInclude(i => i.Category)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.StartDate)
            .ToListAsync();

        var budgetDtos = new List<BudgetDto>();

        foreach (var budget in budgets)
        {
            budgetDtos.Add(await MapToBudgetDto(budget, userId));
        }

        return budgetDtos;
    }

    public async Task<BudgetDto?> GetActiveAsync(int userId)
    {
        var budget = await _context.Budgets
            .Include(b => b.Items)
                .ThenInclude(i => i.Category)
            .FirstOrDefaultAsync(b => b.UserId == userId && b.IsActive);

        if (budget == null)
            return null;

        return await MapToBudgetDto(budget, userId);
    }

    public async Task<BudgetDto?> GetByIdAsync(int id, int userId)
    {
        var budget = await _context.Budgets
            .Include(b => b.Items)
                .ThenInclude(i => i.Category)
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

        if (budget == null)
            return null;

        return await MapToBudgetDto(budget, userId);
    }

    public async Task<BudgetDto> CreateAsync(CreateBudgetDto dto, int userId)
    {
        // Desactivar presupuesto activo anterior
        var activeBudget = await _context.Budgets
            .FirstOrDefaultAsync(b => b.UserId == userId && b.IsActive);

        if (activeBudget != null)
        {
            activeBudget.IsActive = false;
        }

        // Calcular fecha de fin según el período
        var endDate = CalculateEndDate(dto.StartDate, dto.Period);

        var budget = new Budget
        {
            UserId = userId,
            Period = dto.Period,
            StartDate = dto.StartDate,
            EndDate = endDate,
            IsActive = true
        };

        _context.Budgets.Add(budget);
        await _context.SaveChangesAsync();

        // Agregar items
        foreach (var itemDto in dto.Items)
        {
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == itemDto.CategoryId);
            if (!categoryExists)
            {
                throw new InvalidOperationException($"Categoría {itemDto.CategoryId} no encontrada");
            }

            var item = new BudgetItem
            {
                BudgetId = budget.Id,
                CategoryId = itemDto.CategoryId,
                LimitAmount = itemDto.LimitAmount
            };

            _context.BudgetItems.Add(item);
        }

        await _context.SaveChangesAsync();

        // Recargar con includes
        await _context.Entry(budget)
            .Collection(b => b.Items)
            .Query()
            .Include(i => i.Category)
            .LoadAsync();

        return await MapToBudgetDto(budget, userId);
    }

    public async Task<BudgetDto> UpdateItemAsync(int budgetId, int itemId, UpdateBudgetItemDto dto, int userId)
    {
        var budget = await _context.Budgets
            .Include(b => b.Items)
                .ThenInclude(i => i.Category)
            .FirstOrDefaultAsync(b => b.Id == budgetId && b.UserId == userId);

        if (budget == null)
        {
            throw new InvalidOperationException("Presupuesto no encontrado");
        }

        var item = budget.Items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
        {
            throw new InvalidOperationException("Item de presupuesto no encontrado");
        }

        item.LimitAmount = dto.LimitAmount;
        await _context.SaveChangesAsync();

        return await MapToBudgetDto(budget, userId);
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var budget = await _context.Budgets
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

        if (budget == null)
            return false;

        budget.IsDeleted = true;
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeactivateAsync(int id, int userId)
    {
        var budget = await _context.Budgets
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

        if (budget == null)
            return false;

        budget.IsActive = false;
        await _context.SaveChangesAsync();

        return true;
    }

    // Métodos auxiliares

    private DateTime CalculateEndDate(DateTime startDate, BudgetPeriod period)
    {
        return period switch
        {
            BudgetPeriod.Quincenal => startDate.AddDays(15).AddSeconds(-1), // 15 días
            BudgetPeriod.Mensual => startDate.AddMonths(1).AddSeconds(-1),  // 1 mes
            _ => throw new ArgumentException("Período de presupuesto inválido")
        };
    }

    private async Task<BudgetDto> MapToBudgetDto(Budget budget, int userId)
    {
        var items = new List<BudgetItemDto>();

        foreach (var item in budget.Items)
        {
            // Calcular gasto total en esta categoría durante el período del presupuesto
            var spent = await _context.Transactions
                .Where(t => t.UserId == userId &&
                           t.CategoryId == item.CategoryId &&
                           t.Type == TransactionType.Expense &&
                           t.Date >= budget.StartDate &&
                           t.Date <= budget.EndDate)
                .SumAsync(t => (decimal?)t.Amount) ?? 0;

            var remaining = item.LimitAmount - spent;
            var percentageUsed = item.LimitAmount > 0 ? (spent / item.LimitAmount) * 100 : 0;

            items.Add(new BudgetItemDto
            {
                Id = item.Id,
                CategoryId = item.CategoryId,
                CategoryName = item.Category.Name,
                CategoryIcon = item.Category.Icon,
                LimitAmount = item.LimitAmount,
                SpentAmount = spent,
                RemainingAmount = remaining,
                PercentageUsed = Math.Round(percentageUsed, 2)
            });
        }

        return new BudgetDto
        {
            Id = budget.Id,
            Period = budget.Period.ToString(),
            StartDate = budget.StartDate,
            EndDate = budget.EndDate,
            IsActive = budget.IsActive,
            Items = items,
            CreatedAt = budget.CreatedAt
        };
    }
}
