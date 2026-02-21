namespace Ditso.Domain.Entities;

public class BudgetItem
{
    public int Id { get; set; }
    public int BudgetId { get; set; }
    public int CategoryId { get; set; }
    public decimal LimitAmount { get; set; }

    // Navigation properties
    public Budget Budget { get; set; } = null!;
    public Category Category { get; set; } = null!;
}
