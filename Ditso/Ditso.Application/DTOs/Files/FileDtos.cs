namespace Ditso.Application.DTOs.Files;

public class FileUploadResponseDto
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DateTime UploadedAt { get; set; }
}
