using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ditso.Domain.Enums;
using Ditso.Infrastructure.Data;
using System.Security.Claims;

namespace Ditso.API.Controllers;

/// <summary>
/// Endpoints exclusivos para el rol Admin.
/// Demuestra control de acceso basado en roles (RBAC).
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly DitsoDbContext _context;
    private readonly ILogger<AdminController> _logger;

    public AdminController(DitsoDbContext context, ILogger<AdminController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Ver todos los registros de auditoría del sistema (solo Admin).
    /// </summary>
    [HttpGet("audit-logs")]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? action = null,
        [FromQuery] int? userId = null)
    {
        var query = _context.AuditLogs
            .Include(a => a.User)
            .AsQueryable();

        if (!string.IsNullOrEmpty(action))
            query = query.Where(a => a.Action.Contains(action));

        if (userId.HasValue)
            query = query.Where(a => a.UserId == userId.Value);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(a => a.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new
            {
                a.Id,
                a.Action,
                a.EntityType,
                a.EntityId,
                a.Details,
                a.Timestamp,
                UserEmail = a.User != null ? a.User.Email : null,
                UserName  = a.User != null ? a.User.FullName : null,
            })
            .ToListAsync();

        return Ok(new { total, page, pageSize, items });
    }

    /// <summary>
    /// Ver todos los usuarios del sistema (solo Admin).
    /// </summary>
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _context.Users
            .OrderBy(u => u.Email)
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.FullName,
                Role = u.Role.ToString(),
                u.IsActive,
                u.CreatedAt,
            })
            .ToListAsync();

        return Ok(users);
    }

    /// <summary>
    /// Cambiar el rol de un usuario (solo Admin).
    /// </summary>
    [HttpPut("users/{id}/role")]
    public async Task<IActionResult> ChangeUserRole(int id, [FromBody] ChangeRoleRequest request)
    {
        var adminId = GetUserId();
        if (id == adminId)
            return BadRequest(new { message = "No puedes cambiar tu propio rol." });

        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = "Usuario no encontrado." });

        if (!Enum.TryParse<UserRole>(request.Role, true, out var newRole))
            return BadRequest(new { message = $"Rol inválido: {request.Role}. Valores válidos: User, Admin." });

        user.Role = newRole;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Admin {AdminId} cambió el rol de usuario {UserId} a {Role}", adminId, id, newRole);

        return Ok(new { message = $"Rol de {user.FullName} actualizado a {newRole}." });
    }

    /// <summary>
    /// Activar o desactivar un usuario (solo Admin).
    /// </summary>
    [HttpPut("users/{id}/status")]
    public async Task<IActionResult> ToggleUserStatus(int id)
    {
        var adminId = GetUserId();
        if (id == adminId)
            return BadRequest(new { message = "No puedes deshabilitar tu propia cuenta." });

        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = "Usuario no encontrado." });

        user.IsActive = !user.IsActive;
        await _context.SaveChangesAsync();

        var state = user.IsActive ? "activado" : "desactivado";
        _logger.LogInformation("Admin {AdminId} {State} al usuario {UserId}", adminId, state, id);

        return Ok(new { message = $"Usuario {user.FullName} {state} correctamente.", isActive = user.IsActive });
    }
}

public record ChangeRoleRequest(string Role);
