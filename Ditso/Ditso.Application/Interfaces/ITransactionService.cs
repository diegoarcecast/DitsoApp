using Ditso.Application.DTOs.Transactions;

namespace Ditso.Application.Interfaces;

public interface ITransactionService
{
    Task<IEnumerable<TransactionDto>> GetAllAsync(int userId, DateTime? from = null, DateTime? to = null);
    Task<TransactionDto?> GetByIdAsync(int id, int userId);
    Task<TransactionDto> CreateAsync(CreateTransactionDto dto, int userId);
    Task<TransactionDto> UpdateAsync(int id, UpdateTransactionDto dto, int userId);
    Task<bool> DeleteAsync(int id, int userId);
}
