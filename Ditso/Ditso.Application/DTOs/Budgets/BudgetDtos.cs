using Ditso.Domain.Enums;

namespace Ditso.Application.DTOs.Budgets;

public class BudgetDto
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public string Period { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
    public decimal TotalAmount { get; set; }
    public List<BudgetItemDto> Items { get; set; } = new();
    public DateTime CreatedAt { get; set; }

    // ── Financial summary ───────────────────────────────────────────────────────
    /// <summary>Suma de LimitAmount de ítems de ingreso planificados.</summary>
    public decimal PlannedIncome { get; set; }
    /// <summary>Total de transacciones registradas con IsExtraIncome = true.</summary>
    public decimal AdditionalIncome { get; set; }
    /// <summary>Total de ingresos efectivamente recibidos (planificados + adicionales).</summary>
    public decimal TotalIncome { get; set; }
    /// <summary>Total de gastos registrados en el período.</summary>
    public decimal TotalExpenses { get; set; }
    /// <summary>TotalAmount + TotalIncome − TotalExpenses.</summary>
    public decimal AvailableBalance { get; set; }
    /// <summary>Suma de LimitAmount de todos los ítems (excluye sistema).</summary>
    public decimal TotalAssigned { get; set; }
    /// <summary>TotalAmount − TotalAssigned. Puede ser negativo si se excede.</summary>
    public decimal Unassigned { get; set; }
}

public class BudgetItemDto
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryIcon { get; set; } = string.Empty;
    public decimal LimitAmount { get; set; }
    /// <summary>Porcentaje que representa LimitAmount respecto al TotalAmount del presupuesto.</summary>
    public decimal Percentage { get; set; }
    /// <summary>Para ítems de gasto: monto gastado. Para ítems de ingreso: monto recibido.</summary>
    public decimal SpentAmount { get; set; }
    public decimal ReceivedAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public decimal PercentageUsed { get; set; }
    public bool IsIncome { get; set; }
    public bool IsSystemCategory { get; set; }
}

public class CreateBudgetDto
{
    public BudgetPeriod Period { get; set; }
    public DateTime StartDate { get; set; }

    /// <summary>Required when Period = Personalizado</summary>
    public DateTime? CustomEndDate { get; set; }

    public decimal TotalAmount { get; set; }
    public string? Name { get; set; }
    public List<CreateBudgetItemDto> Items { get; set; } = new();
}

public class CreateBudgetItemDto
{
    public int CategoryId { get; set; }
    public decimal LimitAmount { get; set; }
    public bool IsIncome { get; set; }
    public bool IsSystemCategory { get; set; }
}

/// <summary>Edición completa del presupuesto. Todos los campos son opcionales.</summary>
public class UpdateBudgetDto
{
    public string? Name { get; set; }
    public decimal? TotalAmount { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    /// <summary>
    /// Si se incluye, los ítems de gasto se actualizan o reemplazan.
    /// Los ítems de sistema (IsSystemCategory) nunca se tocan.
    /// </summary>
    public List<UpdateBudgetItemInlineDto>? Items { get; set; }
}

/// <summary>Ítem dentro del payload de UpdateBudgetDto.</summary>
public class UpdateBudgetItemInlineDto
{
    public int ItemId { get; set; }
    public decimal LimitAmount { get; set; }
}

public class UpdateBudgetItemDto
{
    public decimal? LimitAmount { get; set; }
    /// <summary>Si se pasa Percentage, el backend recalcula LimitAmount = TotalAmount * Percentage / 100.</summary>
    public decimal? Percentage { get; set; }
}

public class AddBudgetItemDto
{
    public int CategoryId { get; set; }
    public decimal LimitAmount { get; set; }
    public bool IsIncome { get; set; }
}

public class RemoveBudgetItemDto
{
    /// <summary>
    /// Categoría a la que se reasignarán las transacciones del ítem eliminado.
    /// Si null y hay transacciones, el backend rechaza la operación con 409.
    /// </summary>
    public int? ReassignToCategoryId { get; set; }
}

public class SuggestedDistributionItemDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryIcon { get; set; } = string.Empty;
    public decimal Percentage { get; set; }
    public decimal SuggestedAmount { get; set; }
    public bool IsIncome { get; set; }
}

/// <summary>Categoría válida para el presupuesto activo — usada en el formulario de transacciones.</summary>
public class ActiveCategoryDto
{
    public int CategoryId { get; set; }
    public int BudgetItemId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public bool IsSystemCategory { get; set; }
}
