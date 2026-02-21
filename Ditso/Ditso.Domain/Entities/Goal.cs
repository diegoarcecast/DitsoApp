using Ditso.Domain.Common;

namespace Ditso.Domain.Entities;

public class Goal : BaseEntity
{
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal TargetAmount { get; set; }
    public decimal CurrentAmount { get; set; } = 0;
    public DateTime? TargetDate { get; set; }
    public string? Description { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;

    // Business logic
    public decimal GetProgressPercentage()
    {
        if (TargetAmount == 0) return 0;
        return (CurrentAmount / TargetAmount) * 100;
    }
}
