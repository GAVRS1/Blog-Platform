using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using BlogContent.WebAPI.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogContent.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private const int DefaultPageSize = 10;
    private const int MaxPageSize = 100;

    private readonly IUserService _userService;

    public UsersController(IUserService userService) => _userService = userService;

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var user = _userService.GetUserById(id);
        return user == null ? NotFound() : Ok(user);
    }

    [AllowAnonymous]
    [HttpGet("search")]
    public IActionResult Search([FromQuery] string query, [FromQuery] int page = 1, [FromQuery] int pageSize = DefaultPageSize)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, MaxPageSize);

        var result = _userService.SearchUsers(query, page, pageSize);
        return Ok(new PagedResponse<User>(result.Items, result.Total, result.Page, result.PageSize));
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
}
