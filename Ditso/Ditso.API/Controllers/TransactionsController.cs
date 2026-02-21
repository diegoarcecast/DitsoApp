using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Ditso.Application.DTOs.Transactions;
using Ditso.Application.Interfaces;

namespace Ditso.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _transactionService;
    private readonly ILogger<TransactionsController> _logger;

    public TransactionsController(ITransactionService transactionService, ILogger<TransactionsController> logger)
    {
        _transactionService = transactionService;
        _logger = logger;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }

    /// <summary>
    /// Obtener todas las transacciones del usuario autenticado
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TransactionDto>>> GetAll([FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
    {
        try
        {
            var userId = GetUserId();
            var transactions = await _transactionService.GetAllAsync(userId, from, to);
            return Ok(transactions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener transacciones");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Obtener una transacción específica por ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<TransactionDto>> GetById(int id)
    {
        try
        {
            var userId = GetUserId();
            var transaction = await _transactionService.GetByIdAsync(id, userId);

            if (transaction == null)
            {
                return NotFound(new { message = "Transacción no encontrada" });
            }

            return Ok(transaction);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener transacción {Id}", id);
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Crear una nueva transacción
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<TransactionDto>> Create([FromBody] CreateTransactionDto dto)
    {
        try
        {
            var userId = GetUserId();
            var transaction = await _transactionService.CreateAsync(dto, userId);
            _logger.LogInformation("Transacción creada: {Type} de ₡{Amount} por usuario {UserId}", dto.Type, dto.Amount, userId);
            return CreatedAtAction(nameof(GetById), new { id = transaction.Id }, transaction);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear transacción");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Actualizar una transacción existente
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<TransactionDto>> Update(int id, [FromBody] UpdateTransactionDto dto)
    {
        try
        {
            var userId = GetUserId();
            var transaction = await _transactionService.UpdateAsync(id, dto, userId);
            _logger.LogInformation("Transacción {Id} actualizada por usuario {UserId}", id, userId);
            return Ok(transaction);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar transacción {Id}", id);
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Eliminar una transacción (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var userId = GetUserId();
            var result = await _transactionService.DeleteAsync(id, userId);

            if (!result)
            {
                return NotFound(new { message = "Transacción no encontrada" });
            }

            _logger.LogInformation("Transacción {Id} eliminada por usuario {UserId}", id, userId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar transacción {Id}", id);
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }
}
