using Ditso.Application.DTOs.Budgets;

namespace Ditso.Application.Interfaces;

public interface IBudgetService
{
    Task<IEnumerable<BudgetDto>> GetAllAsync(int userId);
    Task<BudgetDto?> GetActiveAsync(int userId);
    Task<BudgetDto?> GetByIdAsync(int id, int userId);
    Task<BudgetDto> CreateAsync(CreateBudgetDto dto, int userId);

    /// <summary>
    /// Edita el presupuesto: nombre, monto total (recalculando ítems) y/o fechas.
    /// </summary>
    Task<BudgetDto> UpdateBudgetAsync(int budgetId, UpdateBudgetDto dto, int userId);

    /// <summary>
    /// Actualiza un ítem del presupuesto. Puede recibir LimitAmount o Percentage.
    /// Si recibe Percentage, recalcula LimitAmount = TotalAmount * Percentage / 100.
    /// </summary>
    Task<BudgetDto> UpdateItemAsync(int budgetId, int itemId, UpdateBudgetItemDto dto, int userId);

    /// <summary>
    /// Agrega una nueva categoría al presupuesto activo con un límite asignado.
    /// </summary>
    Task<BudgetDto> AddItemAsync(int budgetId, AddBudgetItemDto dto, int userId);

    /// <summary>
    /// Elimina una categoría del presupuesto. Si tiene transacciones en el período,
    /// requiere ReassignToCategoryId (retorna 409 si no se proporciona).
    /// </summary>
    Task<BudgetDto> RemoveItemAsync(int budgetId, int itemId, RemoveBudgetItemDto dto, int userId);

    Task<bool> DeleteAsync(int id, int userId);
    Task<bool> DeactivateAsync(int id, int userId);
    Task<IEnumerable<SuggestedDistributionItemDto>> GetSuggestedDistributionAsync(decimal totalAmount);

    /// <summary>
    /// Retorna las categorías válidas del presupuesto activo filtradas por tipo (Income/Expense).
    /// </summary>
    Task<IEnumerable<ActiveCategoryDto>> GetActiveCategoriesAsync(int userId, string type);
}
