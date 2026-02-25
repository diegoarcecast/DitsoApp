using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Ditso.Application.DTOs.Files;
using Ditso.Infrastructure.Data;
using FileEntity = Ditso.Domain.Entities.File;

namespace Ditso.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FilesController : ControllerBase
{
    private readonly DitsoDbContext _db;
    private readonly ILogger<FilesController> _logger;
    private readonly IWebHostEnvironment _env;

    private static readonly string[] AllowedMimeTypes =
        ["image/jpeg", "image/png", "image/webp", "image/heic"];

    private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB

    public FilesController(DitsoDbContext db, ILogger<FilesController> logger, IWebHostEnvironment env)
    {
        _db = db;
        _logger = logger;
        _env = env;
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Subir un comprobante (imagen) asociado a una transacción.
    /// Soporta multipart/form-data con un campo "file".
    /// Tamaño máximo: 10 MB. Formatos: JPEG, PNG, WEBP, HEIC.
    /// </summary>
    [HttpPost("upload")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<ActionResult<FileUploadResponseDto>> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No se recibió ningún archivo." });

        if (file.Length > MaxFileSizeBytes)
            return BadRequest(new { message = "El archivo supera el tamaño máximo de 10 MB." });

        if (!AllowedMimeTypes.Contains(file.ContentType.ToLower()))
            return BadRequest(new { message = $"Tipo de archivo no permitido: {file.ContentType}. Use JPEG, PNG, WEBP o HEIC." });

        try
        {
            var userId = GetUserId();

            // Crear directorio de uploads si no existe
            var uploadsDir = Path.Combine(_env.ContentRootPath, "uploads", userId.ToString());
            Directory.CreateDirectory(uploadsDir);

            // Nombre de archivo único para evitar colisiones
            var ext = Path.GetExtension(file.FileName).ToLower();
            var uniqueName = $"{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadsDir, uniqueName);

            // Guardar archivo en disco
            await using var stream = System.IO.File.Create(filePath);
            await file.CopyToAsync(stream);

            // Registrar en base de datos
            var entity = new FileEntity
            {
                UserId = userId,
                FileName = file.FileName,
                FilePath = filePath,
                FileSize = file.Length,
                MimeType = file.ContentType,
                UploadedAt = DateTime.UtcNow,
            };

            _db.Files.Add(entity);
            await _db.SaveChangesAsync();

            _logger.LogInformation("Archivo subido: {FileName} ({Size} bytes) por usuario {UserId}",
                file.FileName, file.Length, userId);

            return Ok(new FileUploadResponseDto
            {
                Id = entity.Id,
                FileName = file.FileName,
                MimeType = file.ContentType,
                FileSize = file.Length,
                UploadedAt = entity.UploadedAt,
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al subir archivo");
            return StatusCode(500, new { message = "Error interno al procesar el archivo." });
        }
    }

    /// <summary>
    /// Obtener un archivo (comprobante) por su ID.
    /// Solo el propietario puede descargarlo.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetFile(int id)
    {
        try
        {
            var userId = GetUserId();
            var entity = await _db.Files.FindAsync(id);

            if (entity == null || entity.UserId != userId)
                return NotFound(new { message = "Archivo no encontrado." });

            if (!System.IO.File.Exists(entity.FilePath))
                return NotFound(new { message = "El archivo físico no existe en el servidor." });

            var bytes = await System.IO.File.ReadAllBytesAsync(entity.FilePath);
            return File(bytes, entity.MimeType, entity.FileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener archivo {Id}", id);
            return StatusCode(500, new { message = "Error interno del servidor." });
        }
    }

    /// <summary>
    /// Eliminar un archivo (comprobante) por su ID.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFile(int id)
    {
        try
        {
            var userId = GetUserId();
            var entity = await _db.Files.FindAsync(id);

            if (entity == null || entity.UserId != userId)
                return NotFound(new { message = "Archivo no encontrado." });

            // Eliminar archivo físico si existe
            if (System.IO.File.Exists(entity.FilePath))
                System.IO.File.Delete(entity.FilePath);

            _db.Files.Remove(entity);
            await _db.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar archivo {Id}", id);
            return StatusCode(500, new { message = "Error interno del servidor." });
        }
    }
}
