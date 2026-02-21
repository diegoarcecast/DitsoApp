using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Ditso.Infrastructure.Data;
using Ditso.Domain.Entities;
using Ditso.Domain.Enums;

namespace Ditso.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly DitsoDbContext _context;
    private readonly ILogger<CategoriesController> _logger;

    public CategoriesController(DitsoDbContext context, ILogger<CategoriesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }

    /// <summary>
    /// Obtener todas las categorías (predefinidas + personalizadas del usuario)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var userId = GetUserId();

            var categories = await _context.Categories
                .Where(c => c.UserId == null || c.UserId == userId)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Icon,
                    Type = c.Type.ToString(),
                    IsCustom = c.UserId != null
                })
                .OrderBy(c => c.Type)
                .ThenBy(c => c.Name)
                .ToListAsync();

            return Ok(categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener categorías");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Obtener categorías por tipo (Income o Expense)
    /// </summary>
    [HttpGet("by-type/{type}")]
    public async Task<IActionResult> GetByType(string type)
    {
        try
        {
            var userId = GetUserId();

            var categories = await _context.Categories
                .Where(c => (c.UserId == null || c.UserId == userId) && c.Type.ToString() == type)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Icon,
                    Type = c.Type.ToString(),
                    IsCustom = c.UserId != null
                })
                .OrderBy(c => c.Name)
                .ToListAsync();

            return Ok(categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener categorías por tipo");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Crear una categoría personalizada para el usuario
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCategoryRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest(new { message = "El nombre es requerido" });

            if (!Enum.TryParse<TransactionType>(request.Type, true, out var type))
                return BadRequest(new { message = "Tipo inválido. Use 'Income' o 'Expense'" });

            var userId = GetUserId();

            // Verificar que no exista una categoría con el mismo nombre para este usuario
            var exists = await _context.Categories
                .AnyAsync(c => c.Name.ToLower() == request.Name.ToLower().Trim()
                            && (c.UserId == null || c.UserId == userId)
                            && c.Type == type);

            if (exists)
                return Conflict(new { message = "Ya existe una categoría con ese nombre" });

            var category = new Category
            {
                UserId = userId,
                Name = request.Name.Trim(),
                Icon = string.IsNullOrWhiteSpace(request.Icon) ? "category" : request.Icon.Trim(),
                Type = type
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { id = category.Id }, new
            {
                category.Id,
                category.Name,
                category.Icon,
                Type = category.Type.ToString(),
                IsCustom = true
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear categoría");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Eliminar una categoría personalizada del usuario
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var userId = GetUserId();

            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            if (category == null)
                return NotFound(new { message = "Categoría no encontrada o no tienes permiso para eliminarla" });

            // Verificar que no tenga transacciones asociadas
            var hasTransactions = await _context.Transactions
                .AnyAsync(t => t.CategoryId == id);

            if (hasTransactions)
                return BadRequest(new { message = "No se puede eliminar una categoría que tiene transacciones asociadas" });

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar categoría");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }
}

public record CreateCategoryRequest(string Name, string Type, string? Icon);
