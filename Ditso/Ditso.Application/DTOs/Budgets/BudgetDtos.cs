using Ditso.Domain.Enums;

namespace Ditso.Application.DTOs.Budgets;

public class BudgetDto
{
    public int Id { get; set; }
    public string Period { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
    public List<BudgetItemDto> Items { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class BudgetItemDto
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryIcon { get; set; } = string.Empty;
    public decimal LimitAmount { get; set; }
    public decimal SpentAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public decimal PercentageUsed { get; set; }
}

public class CreateBudgetDto
{
    public BudgetPeriod Period { get; set; }
    public DateTime StartDate { get; set; }
    public List<CreateBudgetItemDto> Items { get; set; } = new();
}

public class CreateBudgetItemDto
{
    public int CategoryId { get; set; }
    public decimal LimitAmount { get; set; }
}

public class UpdateBudgetItemDto
{
    public decimal LimitAmount { get; set; }
}
