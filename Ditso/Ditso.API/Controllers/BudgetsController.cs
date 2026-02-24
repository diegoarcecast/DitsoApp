using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Ditso.Application.DTOs.Budgets;
using Ditso.Application.Interfaces;

namespace Ditso.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BudgetsController : ControllerBase
{
    private readonly IBudgetService _budgetService;
    private readonly ILogger<BudgetsController> _logger;

    public BudgetsController(IBudgetService budgetService, ILogger<BudgetsController> logger)
    {
        _budgetService = budgetService;
        _logger = logger;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }

    /// <summary>
    /// Obtener todos los presupuestos del usuario
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BudgetDto>>> GetAll()
    {
        try
        {
            var userId = GetUserId();
            var budgets = await _budgetService.GetAllAsync(userId);
            return Ok(budgets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener presupuestos");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Distribución sugerida de categorías dado un monto total
    /// </summary>
    [HttpGet("suggested-distribution")]
    public async Task<ActionResult<IEnumerable<SuggestedDistributionItemDto>>> GetSuggestedDistribution([FromQuery] decimal totalAmount)
    {
        try
        {
            if (totalAmount <= 0)
                return BadRequest(new { message = "El monto total debe ser mayor a cero" });

            var distribution = await _budgetService.GetSuggestedDistributionAsync(totalAmount);
            return Ok(distribution);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al calcular distribución sugerida");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Categorías válidas del presupuesto activo filtradas por tipo (Income | Expense).
    /// Solo estas categorías pueden usarse al registrar una transacción.
    /// </summary>
    [HttpGet("active-categories")]
    public async Task<ActionResult<IEnumerable<ActiveCategoryDto>>> GetActiveCategories([FromQuery] string type = "Expense")
    {
        try
        {
            if (type != "Income" && type != "Expense")
                return BadRequest(new { message = "El parámetro 'type' debe ser 'Income' o 'Expense'" });

            var userId = GetUserId();
            var categories = await _budgetService.GetActiveCategoriesAsync(userId, type);
            return Ok(categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener categorías activas");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Obtener el presupuesto activo actual
    /// </summary>
    [HttpGet("active")]
    public async Task<ActionResult<BudgetDto>> GetActive()
    {
        try
        {
            var userId = GetUserId();
            var budget = await _budgetService.GetActiveAsync(userId);

            if (budget == null)
            {
                return NotFound(new { message = "No hay presupuesto activo" });
            }

            return Ok(budget);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener presupuesto activo");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Obtener un presupuesto específico por ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<BudgetDto>> GetById(int id)
    {
        try
        {
            var userId = GetUserId();
            var budget = await _budgetService.GetByIdAsync(id, userId);

            if (budget == null)
            {
                return NotFound(new { message = "Presupuesto no encontrado" });
            }

            return Ok(budget);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener presupuesto {Id}", id);
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Crear un nuevo presupuesto (quincenal o mensual)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<BudgetDto>> Create([FromBody] CreateBudgetDto dto)
    {
        try
        {
            var userId = GetUserId();
            var budget = await _budgetService.CreateAsync(dto, userId);
            _logger.LogInformation("Presupuesto {Period} creado por usuario {UserId} con {ItemCount} categorías", 
                dto.Period, userId, dto.Items.Count);
            return CreatedAtAction(nameof(GetById), new { id = budget.Id }, budget);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear presupuesto");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Actualizar el monto límite (o porcentaje) de una categoría en el presupuesto
    /// </summary>
    [HttpPut("{budgetId}/items/{itemId}")]
    public async Task<ActionResult<BudgetDto>> UpdateItem(int budgetId, int itemId, [FromBody] UpdateBudgetItemDto dto)
    {
        try
        {
            var userId = GetUserId();
            var budget = await _budgetService.UpdateItemAsync(budgetId, itemId, dto, userId);
            _logger.LogInformation("Item {ItemId} del presupuesto {BudgetId} actualizado por usuario {UserId}",
                itemId, budgetId, userId);
            return Ok(budget);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar item de presupuesto");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Editar el presupuesto: nombre, monto total, fechas o ítems en bloque.
    /// Al cambiar TotalAmount, se recalculan los montos de todas las categorías proporcionalmente.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<BudgetDto>> UpdateBudget(int id, [FromBody] UpdateBudgetDto dto)
    {
        try
        {
            var userId = GetUserId();
            var budget = await _budgetService.UpdateBudgetAsync(id, dto, userId);
            _logger.LogInformation("Presupuesto {Id} editado por usuario {UserId}", id, userId);
            return Ok(budget);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al editar presupuesto {Id}", id);
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Agregar una categoría (ítem) al presupuesto existente.
    /// </summary>
    [HttpPost("{budgetId}/items")]
    public async Task<ActionResult<BudgetDto>> AddItem(int budgetId, [FromBody] AddBudgetItemDto dto)
    {
        try
        {
            var userId = GetUserId();
            var budget = await _budgetService.AddItemAsync(budgetId, dto, userId);
            _logger.LogInformation("Categoría {CategoryId} añadida al presupuesto {BudgetId} por usuario {UserId}",
                dto.CategoryId, budgetId, userId);
            return Ok(budget);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al añadir ítem al presupuesto {BudgetId}", budgetId);
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Eliminar una categoría del presupuesto.
    /// Si tiene transacciones en el período, requiere ReassignToCategoryId en el body.
    /// </summary>
    [HttpDelete("{budgetId}/items/{itemId}")]
    public async Task<ActionResult<BudgetDto>> RemoveItem(int budgetId, int itemId, [FromBody] RemoveBudgetItemDto dto)
    {
        try
        {
            var userId = GetUserId();
            var budget = await _budgetService.RemoveItemAsync(budgetId, itemId, dto, userId);
            _logger.LogInformation("Ítem {ItemId} eliminado del presupuesto {BudgetId} por usuario {UserId}",
                itemId, budgetId, userId);
            return Ok(budget);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("transacciones"))
        {
            // 409 Conflict — categoría en uso, requiere reasignación
            return Conflict(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar ítem {ItemId} del presupuesto {BudgetId}", itemId, budgetId);
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Desactivar un presupuesto (sin eliminarlo)
    /// </summary>
    [HttpPatch("{id}/deactivate")]
    public async Task<IActionResult> Deactivate(int id)
    {
        try
        {
            var userId = GetUserId();
            var result = await _budgetService.DeactivateAsync(id, userId);

            if (!result)
            {
                return NotFound(new { message = "Presupuesto no encontrado" });
            }

            _logger.LogInformation("Presupuesto {Id} desactivado por usuario {UserId}", id, userId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al desactivar presupuesto {Id}", id);
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Eliminar un presupuesto (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var userId = GetUserId();
            var result = await _budgetService.DeleteAsync(id, userId);

            if (!result)
            {
                return NotFound(new { message = "Presupuesto no encontrado" });
            }

            _logger.LogInformation("Presupuesto {Id} eliminado por usuario {UserId}", id, userId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar presupuesto {Id}", id);
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }
}
