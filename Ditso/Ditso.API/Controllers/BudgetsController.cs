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
    /// Actualizar el monto límite de una categoría en el presupuesto
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
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar item de presupuesto");
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
