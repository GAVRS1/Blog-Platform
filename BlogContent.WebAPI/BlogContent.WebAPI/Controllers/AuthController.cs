using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using BlogContent.Core.Security;
using BlogContent.WebAPI.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IUserService _userService;
    private readonly IConfiguration _config;

    public AuthController(IAuthService authService, IUserService userService, IConfiguration config)
    {
        _authService = authService;
        _userService = userService;
        _config = config;
    }

    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterRequest request)
    {
        if (_authService.UserExists(request.Email))
        {
            return Conflict("Пользователь с таким email уже существует");
        }

        var profile = new Profile
        {
            Username = request.Username,
            FullName = request.FullName ?? string.Empty,
            Bio = request.Bio ?? string.Empty,
            ProfilePictureUrl = request.ProfilePictureUrl ?? string.Empty
        };

        if (request.BirthDate.HasValue)
        {
            var birthDate = DateOnly.FromDateTime(request.BirthDate.Value.Date);
            profile.BirthDate = birthDate;
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var age = today.Year - birthDate.Year;
            if (birthDate.AddYears(age) > today)
            {
                age--;
            }

            profile.Age = Math.Max(age, 0);
        }

        var user = new User
        {
            Email = request.Email,
            Username = request.Username,
            PasswordHash = PasswordHasher.HashPassword(request.Password),
            Profile = profile
        };

        _userService.CreateUser(user);

        var token = GenerateJwtToken(user);
        return Ok(new { token, userId = user.Id });
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        var user = _authService.Login(request.Email, request.Password);
        if (user == null)
        {
            return Unauthorized("Неверный логин или пароль");
        }

        var token = GenerateJwtToken(user);
        return Ok(new { token, userId = user.Id });
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
        return user == null ? NotFound() : Ok(user);
    }

    private bool TryGetUserId(out int userId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out userId);
    }

    private string GenerateJwtToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Username)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
