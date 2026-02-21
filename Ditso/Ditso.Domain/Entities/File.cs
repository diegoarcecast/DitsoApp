using Ditso.Domain.Common;

namespace Ditso.Domain.Entities;

public class File : BaseEntity
{
    public int UserId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string MimeType { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
}
