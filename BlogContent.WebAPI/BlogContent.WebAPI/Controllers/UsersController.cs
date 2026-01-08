using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using BlogContent.Core.Enums;
using BlogContent.Services;
using BlogContent.WebAPI.DTOs;
using BlogContent.WebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Security.Claims;

namespace BlogContent.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private const int DefaultPageSize = 10;
    private const int MaxPageSize = 100;

    private const string AccessDeniedMessage = "Пользователь ограничил круг лиц, которым доступно это действие.";

    private readonly IUserService _userService;
    private readonly IFollowService _followService;

    public UsersController(IUserService userService, IFollowService followService)
    {
        _userService = userService;
        _followService = followService;
    }

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var user = _userService.GetUserById(id);
        if (user == null)
        {
            return NotFound();
        }

        if (TryGetUserId(out var currentUserId) && currentUserId != id)
        {
            var relation = _followService.GetRelationship(currentUserId, id);
            var audience = user.PrivacySettings?.ProfileVisibility ?? Audience.Everyone;
            if (!SettingsAccessChecker.CanAccess(audience, relation.AreFriends))
            {
                return StatusCode(403, new AccessDeniedResponse { Message = AccessDeniedMessage });
            }
        }

        return Ok(ToResponse(user));
    }

    [AllowAnonymous]
    [HttpGet("{id}/public")]
    public IActionResult GetPublicById(int id)
    {
        var user = _userService.GetUserById(id);
        if (user == null)
        {
            return NotFound();
        }

        return Ok(ToPublicResponse(user));
    }

    [AllowAnonymous]
    [HttpGet("search")]
    public IActionResult Search([FromQuery] string query, [FromQuery] int page = 1, [FromQuery] int pageSize = DefaultPageSize)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, MaxPageSize);

        var result = _userService.SearchUsers(query, page, pageSize);
        return Ok(ToPagedResponse(result));
    }

    [AllowAnonymous]
    [HttpGet("check")]
    public IActionResult Check([FromQuery] string? username, [FromQuery] string? email)
    {
        if (string.IsNullOrWhiteSpace(username) && string.IsNullOrWhiteSpace(email))
        {
            return BadRequest("Не указан username или email для проверки.");
        }

        var usernameTaken = !string.IsNullOrWhiteSpace(username) && _userService.GetUserByUsername(username) != null;
        var emailTaken = !string.IsNullOrWhiteSpace(email) && _userService.GetUserByEmail(email) != null;

        return Ok(new { usernameTaken, emailTaken });
    }

    [HttpPut("profile")]
    public IActionResult UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var user = _userService.GetUserById(userId);
        user.Profile ??= new Profile { UserId = userId };

        user.Profile.FullName = request.FullName?.Trim() ?? string.Empty;
        user.Profile.Bio = request.Bio?.Trim() ?? string.Empty;
        user.Profile.ProfilePictureUrl = request.ProfilePictureUrl?.Trim() ?? string.Empty;

        if (request.BirthDate.HasValue)
        {
            var birth = request.BirthDate.Value;
            user.Profile.BirthDate = birth;
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var age = today.Year - birth.Year;
            if (birth.AddYears(age) > today)
            {
                age--;
            }
            user.Profile.Age = Math.Max(age, 0);
        }
        else
        {
            user.Profile.BirthDate = default;
            user.Profile.Age = 0;
        }

        _userService.UpdateUser(user);
        return Ok(ToResponse(user));
    }

    private static UserResponseDto ToResponse(User user) => user.ToDto();

    private static PublicUserResponseDto ToPublicResponse(User user) => user.ToPublicDto();

    private static PagedResponse<UserResponseDto> ToPagedResponse(PagedResult<User> source)
    {
        var items = source.Items.Select(ToResponse);
        return new PagedResponse<UserResponseDto>(items, source.Total, source.Page, source.PageSize);
    }

    private bool TryGetUserId(out int userId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out userId);
    }
}
