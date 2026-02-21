using Ditso.Application.DTOs.Budgets;

namespace Ditso.Application.Interfaces;

public interface IBudgetService
{
    Task<IEnumerable<BudgetDto>> GetAllAsync(int userId);
    Task<BudgetDto?> GetActiveAsync(int userId);
    Task<BudgetDto?> GetByIdAsync(int id, int userId);
    Task<BudgetDto> CreateAsync(CreateBudgetDto dto, int userId);
    Task<BudgetDto> UpdateItemAsync(int budgetId, int itemId, UpdateBudgetItemDto dto, int userId);
    Task<bool> DeleteAsync(int id, int userId);
    Task<bool> DeactivateAsync(int id, int userId);
}
