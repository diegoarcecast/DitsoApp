using Ditso.Domain.Enums;

namespace Ditso.Application.DTOs.Transactions;

public class TransactionDto
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Type { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string? Description { get; set; }
    public int? FileId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateTransactionDto
{
    public int CategoryId { get; set; }
    public decimal Amount { get; set; }
    public TransactionType Type { get; set; }
    public DateTime Date { get; set; }
    public string? Description { get; set; }
}

public class UpdateTransactionDto
{
    public int? CategoryId { get; set; }
    public decimal? Amount { get; set; }
    public DateTime? Date { get; set; }
    public string? Description { get; set; }
}
