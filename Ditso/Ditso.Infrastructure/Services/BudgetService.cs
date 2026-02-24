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

    // ID de la categoría sistema "Ingresos Adicionales" (seed data, Id = 9)
    private const int IngresoAdicionalesCategoryId = 9;

    public BudgetService(DitsoDbContext context)
    {
        _context = context;
    }

    // ─── Suggested distribution ────────────────────────────────────────────────
    private static readonly (string Name, decimal Percentage)[] DefaultExpenseDistribution =
    [
        ("Comida",          30m),
        ("Transporte",      15m),
        ("Entretenimiento", 15m),
        ("Servicios",       20m),
        ("Salud",           10m),
        ("Comida Rápida",   10m),
    ];

    public async Task<IEnumerable<SuggestedDistributionItemDto>> GetSuggestedDistributionAsync(decimal totalAmount)
    {
        var categories = await _context.Categories
            .Where(c => c.Type == TransactionType.Expense)
            .ToListAsync();

        var result = new List<SuggestedDistributionItemDto>();

        foreach (var (name, pct) in DefaultExpenseDistribution)
        {
            var cat = categories.FirstOrDefault(c =>
                string.Equals(c.Name, name, StringComparison.OrdinalIgnoreCase));

            result.Add(new SuggestedDistributionItemDto
            {
                CategoryId      = cat?.Id ?? 0,
                CategoryName    = cat?.Name ?? name,
                CategoryIcon    = cat?.Icon ?? "ellipsis-horizontal",
                Percentage      = pct,
                SuggestedAmount = Math.Round(totalAmount * pct / 100m, 0),
                IsIncome        = false,
            });
        }

        return result;
    }

    // ─── Active categories ─────────────────────────────────────────────────────
    public async Task<IEnumerable<ActiveCategoryDto>> GetActiveCategoriesAsync(int userId, string type)
    {
        var isIncome = string.Equals(type, "Income", StringComparison.OrdinalIgnoreCase);

        var activeBudget = await _context.Budgets
            .Include(b => b.Items)
                .ThenInclude(i => i.Category)
            .FirstOrDefaultAsync(b => b.UserId == userId && b.IsActive);

        if (activeBudget == null)
            return Enumerable.Empty<ActiveCategoryDto>();

        return activeBudget.Items
            .Where(i => i.IsIncome == isIncome)
            .Select(i => new ActiveCategoryDto
            {
                CategoryId       = i.CategoryId,
                BudgetItemId     = i.Id,
                Name             = i.Category.Name,
                Icon             = i.Category.Icon,
                IsSystemCategory = i.IsSystemCategory,
            })
            .ToList();
    }

    // ─── Read ──────────────────────────────────────────────────────────────────
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
            budgetDtos.Add(await MapToBudgetDto(budget, userId));

        return budgetDtos;
    }

    public async Task<BudgetDto?> GetActiveAsync(int userId)
    {
        var budget = await _context.Budgets
            .Include(b => b.Items)
                .ThenInclude(i => i.Category)
            .FirstOrDefaultAsync(b => b.UserId == userId && b.IsActive);

        return budget == null ? null : await MapToBudgetDto(budget, userId);
    }

    public async Task<BudgetDto?> GetByIdAsync(int id, int userId)
    {
        var budget = await _context.Budgets
            .Include(b => b.Items)
                .ThenInclude(i => i.Category)
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

        return budget == null ? null : await MapToBudgetDto(budget, userId);
    }

    // ─── Create ────────────────────────────────────────────────────────────────
    public async Task<BudgetDto> CreateAsync(CreateBudgetDto dto, int userId)
    {
        // Desactivar presupuesto activo anterior
        var activeBudget = await _context.Budgets
            .FirstOrDefaultAsync(b => b.UserId == userId && b.IsActive);
        if (activeBudget != null)
            activeBudget.IsActive = false;

        var endDate = CalculateEndDate(dto.StartDate, dto.Period, dto.CustomEndDate);

        var budget = new Budget
        {
            UserId      = userId,
            Name        = dto.Name,
            Period      = dto.Period,
            StartDate   = dto.StartDate,
            EndDate     = endDate,
            TotalAmount = dto.TotalAmount,
            IsActive    = true
        };

        _context.Budgets.Add(budget);
        await _context.SaveChangesAsync();

        // Agregar ítems del usuario
        foreach (var itemDto in dto.Items)
        {
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == itemDto.CategoryId);
            if (!categoryExists)
                throw new InvalidOperationException($"Categoría {itemDto.CategoryId} no encontrada");

            _context.BudgetItems.Add(new BudgetItem
            {
                BudgetId         = budget.Id,
                CategoryId       = itemDto.CategoryId,
                LimitAmount      = itemDto.LimitAmount,
                IsIncome         = itemDto.IsIncome,
                IsSystemCategory = itemDto.IsSystemCategory,
            });
        }

        // Auto-añadir "Ingresos Adicionales" si el usuario no la incluyó
        var alreadyHasIngresosAdicionales = dto.Items.Any(i => i.CategoryId == IngresoAdicionalesCategoryId);
        if (!alreadyHasIngresosAdicionales)
        {
            _context.BudgetItems.Add(new BudgetItem
            {
                BudgetId         = budget.Id,
                CategoryId       = IngresoAdicionalesCategoryId,
                LimitAmount      = 0,
                IsIncome         = true,
                IsSystemCategory = true,
            });
        }

        await _context.SaveChangesAsync();

        await _context.Entry(budget)
            .Collection(b => b.Items)
            .Query()
            .Include(i => i.Category)
            .LoadAsync();

        return await MapToBudgetDto(budget, userId);
    }

    // ─── Update budget (header + items inline) ─────────────────────────────────
    public async Task<BudgetDto> UpdateBudgetAsync(int budgetId, UpdateBudgetDto dto, int userId)
    {
        var budget = await _context.Budgets
            .Include(b => b.Items)
                .ThenInclude(i => i.Category)
            .FirstOrDefaultAsync(b => b.Id == budgetId && b.UserId == userId)
            ?? throw new InvalidOperationException("Presupuesto no encontrado");

        var previousTotal = budget.TotalAmount;

        // Actualizar campos del header
        if (dto.Name is not null)
            budget.Name = dto.Name;

        if (dto.StartDate.HasValue)
            budget.StartDate = dto.StartDate.Value;

        if (dto.EndDate.HasValue)
            budget.EndDate = dto.EndDate.Value;

        // Si cambia el monto total → recalcular LimitAmount de todos los ítems no-sistema
        // usando la proporción que tenían respecto al total anterior
        if (dto.TotalAmount.HasValue && dto.TotalAmount.Value != previousTotal)
        {
            budget.TotalAmount = dto.TotalAmount.Value;

            foreach (var item in budget.Items.Where(i => !i.IsSystemCategory))
            {
                var oldPct = previousTotal > 0
                    ? item.LimitAmount / previousTotal * 100m
                    : 0m;
                item.LimitAmount = Math.Round(budget.TotalAmount * oldPct / 100m, 0);
            }
        }

        // Actualizar ítems individuales si se envían (modo bulk-edit)
        if (dto.Items is { Count: > 0 })
        {
            foreach (var itemUpd in dto.Items)
            {
                var item = budget.Items.FirstOrDefault(i => i.Id == itemUpd.ItemId && !i.IsSystemCategory)
                    ?? throw new InvalidOperationException($"Ítem {itemUpd.ItemId} no encontrado o es ítem de sistema");

                item.LimitAmount = itemUpd.LimitAmount;
            }
        }

        await _context.SaveChangesAsync();
        return await MapToBudgetDto(budget, userId);
    }

    // ─── Update single item ────────────────────────────────────────────────────
    public async Task<BudgetDto> UpdateItemAsync(int budgetId, int itemId, UpdateBudgetItemDto dto, int userId)
    {
        var budget = await _context.Budgets
            .Include(b => b.Items)
                .ThenInclude(i => i.Category)
            .FirstOrDefaultAsync(b => b.Id == budgetId && b.UserId == userId)
            ?? throw new InvalidOperationException("Presupuesto no encontrado");

        var item = budget.Items.FirstOrDefault(i => i.Id == itemId)
            ?? throw new InvalidOperationException("Ítem de presupuesto no encontrado");

        if (item.IsSystemCategory)
            throw new InvalidOperationException("No se puede editar un ítem de sistema");

        if (dto.Percentage.HasValue)
        {
            // Porcentaje → recalcular monto
            item.LimitAmount = Math.Round(budget.TotalAmount * dto.Percentage.Value / 100m, 0);
        }
        else if (dto.LimitAmount.HasValue)
        {
            item.LimitAmount = dto.LimitAmount.Value;
        }

        await _context.SaveChangesAsync();
        return await MapToBudgetDto(budget, userId);
    }

    // ─── Add item ──────────────────────────────────────────────────────────────
    public async Task<BudgetDto> AddItemAsync(int budgetId, AddBudgetItemDto dto, int userId)
    {
        var budget = await _context.Budgets
            .Include(b => b.Items)
                .ThenInclude(i => i.Category)
            .FirstOrDefaultAsync(b => b.Id == budgetId && b.UserId == userId)
            ?? throw new InvalidOperationException("Presupuesto no encontrado");

        // Validar que la categoría existe
        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId);
        if (!categoryExists)
            throw new InvalidOperationException($"Categoría {dto.CategoryId} no encontrada");

        // Validar que no esté ya en el presupuesto
        if (budget.Items.Any(i => i.CategoryId == dto.CategoryId))
            throw new InvalidOperationException("La categoría ya está incluida en el presupuesto");

        var newItem = new BudgetItem
        {
            BudgetId         = budgetId,
            CategoryId       = dto.CategoryId,
            LimitAmount      = dto.LimitAmount,
            IsIncome         = dto.IsIncome,
            IsSystemCategory = false,
        };

        _context.BudgetItems.Add(newItem);
        await _context.SaveChangesAsync();

        // Recargar para incluir la relación Category
        await _context.Entry(newItem).Reference(i => i.Category).LoadAsync();

        return await MapToBudgetDto(budget, userId);
    }

    // ─── Remove item ───────────────────────────────────────────────────────────
    public async Task<BudgetDto> RemoveItemAsync(int budgetId, int itemId, RemoveBudgetItemDto dto, int userId)
    {
        var budget = await _context.Budgets
            .Include(b => b.Items)
                .ThenInclude(i => i.Category)
            .FirstOrDefaultAsync(b => b.Id == budgetId && b.UserId == userId)
            ?? throw new InvalidOperationException("Presupuesto no encontrado");

        var item = budget.Items.FirstOrDefault(i => i.Id == itemId)
            ?? throw new InvalidOperationException("Ítem de presupuesto no encontrado");

        if (item.IsSystemCategory)
            throw new InvalidOperationException("No se puede eliminar un ítem de sistema");

        // Verificar si tiene transacciones en el período
        var hasTransactions = await _context.Transactions
            .AnyAsync(t => t.UserId == userId &&
                           t.CategoryId == item.CategoryId &&
                           t.Date >= budget.StartDate &&
                           t.Date <= budget.EndDate);

        if (hasTransactions)
        {
            if (!dto.ReassignToCategoryId.HasValue)
                throw new InvalidOperationException(
                    "La categoría tiene transacciones en el período. " +
                    "Proporciona ReassignToCategoryId para reasignarlas.");

            // Validar que la categoría destino existe en el presupuesto
            var targetItem = budget.Items.FirstOrDefault(i => i.CategoryId == dto.ReassignToCategoryId.Value);
            if (targetItem == null)
                throw new InvalidOperationException("La categoría de reasignación no pertenece a este presupuesto");

            // Reasignar transacciones
            var transactions = await _context.Transactions
                .Where(t => t.UserId == userId &&
                            t.CategoryId == item.CategoryId &&
                            t.Date >= budget.StartDate &&
                            t.Date <= budget.EndDate)
                .ToListAsync();

            foreach (var tx in transactions)
                tx.CategoryId = dto.ReassignToCategoryId.Value;
        }

        _context.BudgetItems.Remove(item);
        await _context.SaveChangesAsync();

        // Recargar items
        await _context.Entry(budget)
            .Collection(b => b.Items)
            .Query()
            .Include(i => i.Category)
            .LoadAsync();

        return await MapToBudgetDto(budget, userId);
    }

    // ─── Delete / Deactivate ───────────────────────────────────────────────────
    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var budget = await _context.Budgets
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
        if (budget == null) return false;

        budget.IsDeleted = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeactivateAsync(int id, int userId)
    {
        var budget = await _context.Budgets
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
        if (budget == null) return false;

        budget.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────
    private static DateTime CalculateEndDate(DateTime startDate, BudgetPeriod period, DateTime? customEndDate)
    {
        return period switch
        {
            BudgetPeriod.Semanal       => startDate.AddDays(7).AddSeconds(-1),
            BudgetPeriod.Quincenal     => startDate.AddDays(15).AddSeconds(-1),
            BudgetPeriod.Mensual       => startDate.AddMonths(1).AddSeconds(-1),
            BudgetPeriod.Personalizado =>
                customEndDate.HasValue
                    ? customEndDate.Value.Date.AddDays(1).AddSeconds(-1)
                    : throw new ArgumentException("Se requiere CustomEndDate para período Personalizado"),
            _ => throw new ArgumentException("Período de presupuesto inválido")
        };
    }

    private async Task<BudgetDto> MapToBudgetDto(Budget budget, int userId)
    {
        var items = new List<BudgetItemDto>();
        decimal totalExpenses        = 0;
        decimal totalIncomeReceived  = 0;
        decimal additionalIncome     = 0;
        decimal plannedIncome        = 0;

        foreach (var item in budget.Items)
        {
            // Calcular Percentage del ítem respecto al TotalAmount del presupuesto
            var percentage = budget.TotalAmount > 0 && !item.IsSystemCategory
                ? Math.Round(item.LimitAmount / budget.TotalAmount * 100m, 2)
                : 0m;

            if (item.IsIncome)
            {
                var received = await _context.Transactions
                    .Where(t => t.UserId == userId &&
                                t.CategoryId == item.CategoryId &&
                                t.Type == TransactionType.Income &&
                                t.Date >= budget.StartDate &&
                                t.Date <= budget.EndDate)
                    .SumAsync(t => (decimal?)t.Amount) ?? 0;

                var extraReceived = await _context.Transactions
                    .Where(t => t.UserId == userId &&
                                t.CategoryId == item.CategoryId &&
                                t.Type == TransactionType.Income &&
                                t.IsExtraIncome &&
                                t.Date >= budget.StartDate &&
                                t.Date <= budget.EndDate)
                    .SumAsync(t => (decimal?)t.Amount) ?? 0;

                totalIncomeReceived += received;
                additionalIncome    += extraReceived;

                if (!item.IsSystemCategory)
                    plannedIncome += item.LimitAmount;

                var pct = item.LimitAmount > 0 ? (received / item.LimitAmount) * 100 : 0;

                items.Add(new BudgetItemDto
                {
                    Id               = item.Id,
                    CategoryId       = item.CategoryId,
                    CategoryName     = item.Category.Name,
                    CategoryIcon     = item.Category.Icon,
                    LimitAmount      = item.LimitAmount,
                    Percentage       = percentage,
                    SpentAmount      = 0,
                    ReceivedAmount   = received,
                    RemainingAmount  = item.LimitAmount - received,
                    PercentageUsed   = Math.Round(pct, 2),
                    IsIncome         = true,
                    IsSystemCategory = item.IsSystemCategory,
                });
            }
            else
            {
                var spent = await _context.Transactions
                    .Where(t => t.UserId == userId &&
                                t.CategoryId == item.CategoryId &&
                                t.Type == TransactionType.Expense &&
                                t.Date >= budget.StartDate &&
                                t.Date <= budget.EndDate)
                    .SumAsync(t => (decimal?)t.Amount) ?? 0;

                totalExpenses += spent;

                var remaining      = item.LimitAmount - spent;
                var percentageUsed = item.LimitAmount > 0 ? (spent / item.LimitAmount) * 100 : 0;

                items.Add(new BudgetItemDto
                {
                    Id               = item.Id,
                    CategoryId       = item.CategoryId,
                    CategoryName     = item.Category.Name,
                    CategoryIcon     = item.Category.Icon,
                    LimitAmount      = item.LimitAmount,
                    Percentage       = percentage,
                    SpentAmount      = spent,
                    ReceivedAmount   = 0,
                    RemainingAmount  = remaining,
                    PercentageUsed   = Math.Round(percentageUsed, 2),
                    IsIncome         = false,
                    IsSystemCategory = false,
                });
            }
        }

        var availableBalance = budget.TotalAmount + totalIncomeReceived - totalExpenses;

        // TotalAssigned = suma de LimitAmount de ítems no-sistema
        var totalAssigned = items
            .Where(i => !i.IsSystemCategory)
            .Sum(i => i.LimitAmount);

        var unassigned = budget.TotalAmount - totalAssigned;

        return new BudgetDto
        {
            Id               = budget.Id,
            Name             = budget.Name,
            Period           = budget.Period.ToString(),
            StartDate        = budget.StartDate,
            EndDate          = budget.EndDate,
            IsActive         = budget.IsActive,
            TotalAmount      = budget.TotalAmount,
            Items            = items,
            CreatedAt        = budget.CreatedAt,
            PlannedIncome    = plannedIncome,
            AdditionalIncome = additionalIncome,
            TotalIncome      = totalIncomeReceived,
            TotalExpenses    = totalExpenses,
            AvailableBalance = availableBalance,
            TotalAssigned    = totalAssigned,
            Unassigned       = unassigned,
        };
    }
}
