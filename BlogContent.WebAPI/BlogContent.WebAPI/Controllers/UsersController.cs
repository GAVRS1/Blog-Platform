using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using BlogContent.WebAPI.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

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

    [HttpGet("search")]
    public IActionResult Search([FromQuery] string query, [FromQuery] int page = 1, [FromQuery] int pageSize = DefaultPageSize)
    {
        var user = _userService.GetUserByEmail(query);
        var results = user != null ? new[] { user } : Array.Empty<User>();
        return Ok(ToPagedResponse(results, page, pageSize));
    }

    private static PagedResponse<T> ToPagedResponse<T>(IEnumerable<T> source, int page, int pageSize)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, MaxPageSize);

        var items = source.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        var total = source.Count();

        return new PagedResponse<T>(items, total, page, pageSize);
    }
}
