using Ditso.Application.DTOs.Auth;

namespace Ditso.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
    Task<UserDto> RegisterAsync(RegisterRequestDto request);
    Task<LoginResponseDto> RefreshTokenAsync(string refreshToken);
    Task<UserDto> UpdateProfileAsync(int userId, UpdateProfileRequestDto request);
    Task ChangePasswordAsync(int userId, ChangePasswordRequestDto request);
}
