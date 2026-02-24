using Ditso.Application.DTOs.FinancialHealth;

namespace Ditso.Application.Interfaces;

public interface IFinancialHealthService
{
    Task<FinancialHealthDto> GetHealthAsync(int userId, DateTime startDate, DateTime endDate);
}
