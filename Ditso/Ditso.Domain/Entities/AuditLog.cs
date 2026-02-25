namespace Ditso.Domain.Entities;

/// <summary>
/// Registro de auditoría: cada acción relevante del sistema queda registrada aquí.
/// Esta tabla alimenta el módulo de monitoreo y logs requerido por el TFG.
/// </summary>
public class AuditLog
{
    public int Id { get; set; }

    /// <summary>Usuario que ejecutó la acción (null = sistema).</summary>
    public int? UserId { get; set; }

    /// <summary>Acción realizada: TransactionCreated, ProfileUpdated, Login, etc.</summary>
    public string Action { get; set; } = string.Empty;

    /// <summary>Entidad afectada: Transaction, Budget, User…</summary>
    public string EntityType { get; set; } = string.Empty;

    /// <summary>ID de la entidad afectada.</summary>
    public int? EntityId { get; set; }

    /// <summary>Detalle adicional en texto libre (JSON o descripción).</summary>
    public string? Details { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    // Navigation
    public User? User { get; set; }
}
