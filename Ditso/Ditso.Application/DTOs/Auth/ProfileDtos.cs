using System.ComponentModel.DataAnnotations;

namespace Ditso.Application.DTOs.Auth;

public class UpdateProfileRequestDto
{
    [Required(ErrorMessage = "El nombre completo es requerido.")]
    [MaxLength(200)]
    public string FullName { get; set; } = string.Empty;
}

public class ChangePasswordRequestDto
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required]
    [MinLength(6, ErrorMessage = "La nueva contraseña debe tener al menos 6 caracteres.")]
    public string NewPassword { get; set; } = string.Empty;

    [Required]
    [Compare(nameof(NewPassword), ErrorMessage = "Las contraseñas no coinciden.")]
    public string ConfirmPassword { get; set; } = string.Empty;
}
