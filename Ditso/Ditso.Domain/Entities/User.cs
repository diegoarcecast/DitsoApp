using Ditso.Domain.Common;
using Ditso.Domain.Enums;

namespace Ditso.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.User;
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public ICollection<Budget> Budgets { get; set; } = new List<Budget>();
    public ICollection<Debt> Debts { get; set; } = new List<Debt>();
    public ICollection<Goal> Goals { get; set; } = new List<Goal>();
    public ICollection<Category> Categories { get; set; } = new List<Category>();
    public ICollection<File> Files { get; set; } = new List<File>();
}
