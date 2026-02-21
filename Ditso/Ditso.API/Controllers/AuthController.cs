using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ditso.Application.DTOs.Auth;
using Ditso.Application.Interfaces;

namespace Ditso.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Iniciar sesión con email y contraseña
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        try
        {
            var response = await _authService.LoginAsync(request);
            _logger.LogInformation("Usuario {Email} inició sesión exitosamente", request.Email);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Intento de login fallido para {Email}: {Message}", request.Email, ex.Message);
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en login para {Email}", request.Email);
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Registrar nuevo usuario
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<UserDto>> Register([FromBody] RegisterRequestDto request)
    {
        try
        {
            var user = await _authService.RegisterAsync(request);
            _logger.LogInformation("Nuevo usuario registrado: {Email}", request.Email);
            return CreatedAtAction(nameof(Register), new { id = user.Id }, user);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Intento de registro fallido: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en registro");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }

    /// <summary>
    /// Refrescar token de acceso
    /// </summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponseDto>> RefreshToken([FromBody] string refreshToken)
    {
        try
        {
            var response = await _authService.RefreshTokenAsync(refreshToken);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al refrescar token");
            return StatusCode(500, new { message = "Error interno del servidor" });
        }
    }
}
