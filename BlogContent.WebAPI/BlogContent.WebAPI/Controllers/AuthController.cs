using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using BlogContent.Core.Security;
using BlogContent.WebAPI.DTOs;
using BlogContent.WebAPI.Options;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Mail;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IUserService _userService;
    private readonly JwtOptions _jwtOptions;

    public AuthController(IAuthService authService, IUserService userService, IOptions<JwtOptions> jwtOptions)
    {
        _authService = authService;
        _userService = userService;
        _jwtOptions = jwtOptions.Value;
    }

    [HttpPost("register/start")]
    public async Task<IActionResult> RegisterStart([FromBody] RegisterStartRequest request, CancellationToken cancellationToken)
    {
        if (_authService.UserExists(request.Email))
        {
            return Conflict("Пользователь с таким email уже существует");
        }

        try
        {
            var temporaryKey = await _authService.StartRegistrationAsync(request.Email, cancellationToken);
            return Ok(new { temporaryKey });
        }
        catch (SmtpException)
        {
            return BadRequest("Не удалось отправить письмо подтверждения. Проверьте настройки SMTP.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("register/verify")]
    public async Task<IActionResult> RegisterVerify([FromBody] RegisterVerifyRequest request, CancellationToken cancellationToken)
    {
        var success = await _authService.VerifyRegistrationAsync(request.TemporaryKey, request.Code, cancellationToken);
        if (!success)
        {
            return BadRequest("Неверный или истекший код подтверждения");
        }

        return Ok(new { request.TemporaryKey });
    }

    [HttpPost("register/resend")]
    public async Task<IActionResult> RegisterResend([FromBody] RegisterResendRequest request, CancellationToken cancellationToken)
    {
        try
        {
            await _authService.ResendCodeAsync(request.TemporaryKey, cancellationToken);
            return Ok(new { request.TemporaryKey });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("register/complete")]
    public async Task<IActionResult> RegisterComplete([FromBody] RegisterCompleteRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _authService.CompleteRegistrationAsync(
                request.TemporaryKey,
                request.Password,
                request.Username,
                request.FullName,
                request.BirthDate,
                request.Bio,
                request.ProfilePictureUrl,
                cancellationToken);

            var token = GenerateJwtToken(user);
            return Ok(new { token, userId = user.Id });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        try
        {
            var user = _authService.Login(request.Email, request.Password);
            if (user == null)
            {
                return Unauthorized("Неверный логин или пароль");
            }

            var token = GenerateJwtToken(user);
            return Ok(new { token, userId = user.Id });
        }
        catch (Exception ex)
        {
            if (ex.Message.Contains("заблокирован", StringComparison.OrdinalIgnoreCase))
            {
                return StatusCode(403, new { message = ex.Message });
            }

            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var user = _userService.GetUserById(userId);
        return user == null ? NotFound() : Ok(user.ToDto());
    }

    private bool TryGetUserId(out int userId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out userId);
    }

    private string GenerateJwtToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Username)
        };

        if (user.Status == Core.Enums.UserStatus.Admin)
        {
            claims.Add(new Claim(ClaimTypes.Role, "Admin"));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.Key!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _jwtOptions.Issuer,
            audience: _jwtOptions.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
