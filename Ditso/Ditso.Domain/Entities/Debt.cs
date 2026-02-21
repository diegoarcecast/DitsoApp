using Ditso.Domain.Common;

namespace Ditso.Domain.Entities;

public class Debt : BaseEntity
{
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal PendingBalance { get; set; }
    public decimal InterestRate { get; set; }
    public decimal MonthlyPayment { get; set; }
    public DateTime NextDueDate { get; set; }
    public string Creditor { get; set; } = string.Empty;

    // Navigation properties
    public User User { get; set; } = null!;
}
