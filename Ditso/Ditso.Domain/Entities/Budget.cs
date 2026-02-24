using Ditso.Domain.Common;
using Ditso.Domain.Enums;

namespace Ditso.Domain.Entities;

public class Budget : BaseEntity
{
    public int UserId { get; set; }
    public string? Name { get; set; }
    public BudgetPeriod Period { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;
    public decimal TotalAmount { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<BudgetItem> Items { get; set; } = new List<BudgetItem>();
}

