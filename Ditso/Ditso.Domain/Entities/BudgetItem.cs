namespace Ditso.Domain.Entities;

public class BudgetItem
{
    public int Id { get; set; }
    public int BudgetId { get; set; }
    public int CategoryId { get; set; }

    /// <summary>Monto límite de gasto (o monto esperado para ítems de ingreso).</summary>
    public decimal LimitAmount { get; set; }

    /// <summary>true = este ítem es una categoría de ingreso dentro del presupuesto.</summary>
    public bool IsIncome { get; set; }

    /// <summary>true = categoría del sistema (Ingresos Adicionales), sin límite máximo.</summary>
    public bool IsSystemCategory { get; set; }

    // Navigation properties
    public Budget Budget { get; set; } = null!;
    public Category Category { get; set; } = null!;
}
