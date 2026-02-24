using Ditso.Domain.Common;
using Ditso.Domain.Enums;

namespace Ditso.Domain.Entities;

public class Transaction : BaseEntity
{
    public int UserId { get; set; }
    public int CategoryId { get; set; }
    public decimal Amount { get; set; }
    public TransactionType Type { get; set; }
    public DateTime Date { get; set; }
    public string? Description { get; set; }
    public int? FileId { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();

    /// <summary>true = ingreso adicional no planificado (horas extra, freelance, regalo, etc.).</summary>
    public bool IsExtraIncome { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Category Category { get; set; } = null!;
    public File? File { get; set; }
}
