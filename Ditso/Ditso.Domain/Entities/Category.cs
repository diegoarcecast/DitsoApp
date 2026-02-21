using Ditso.Domain.Common;
using Ditso.Domain.Enums;

namespace Ditso.Domain.Entities;

public class Category : BaseEntity
{
    public int? UserId { get; set; } // NULL = predefinida, NOT NULL = personalizada
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public TransactionType Type { get; set; }

    // Navigation properties
    public User? User { get; set; }
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public ICollection<BudgetItem> BudgetItems { get; set; } = new List<BudgetItem>();
}
