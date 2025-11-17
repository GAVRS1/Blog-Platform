using BlogContent.Core.Models;
using BlogContent.Services;
using BlogContent.WebAPI.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Security.Claims;

namespace BlogContent.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PostsController : ControllerBase
{
    private const int DefaultPageSize = 10;
    private const int MaxPageSize = 100;

    private readonly PostService _postService;

    public PostsController(PostService postService) => _postService = postService;

    [HttpGet]
    public IActionResult GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = DefaultPageSize)
    {
        var posts = _postService.GetAllPosts().ToList();
        return Ok(ToPagedResponse(posts, page, pageSize));
    }

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var post = _postService.GetPostById(id);
        return post == null ? NotFound() : Ok(post);
    }

    [HttpGet("user/{userId}")]
    public IActionResult GetByUserId(int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = DefaultPageSize)
    {
        var posts = _postService.GetPostsByUser(userId).ToList();
        return Ok(ToPagedResponse(posts, page, pageSize));
    }

    [HttpPost]
    public IActionResult Create([FromBody] PostDto dto)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var post = new Post
        {
            Title = dto.Title,
            Content = dto.Content,
            ContentType = dto.ContentType,
            ImageUrl = dto.ImageUrl,
            VideoUrl = dto.VideoUrl,
            AudioUrl = dto.AudioUrl,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _postService.CreatePost(post);
        return CreatedAtAction(nameof(GetById), new { id = post.Id }, post);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        _postService.DeletePost(id);
        return NoContent();
    }

    private static PagedResponse<T> ToPagedResponse<T>(IEnumerable<T> source, int page, int pageSize)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, MaxPageSize);

        var items = source.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        var total = source.Count();

        return new PagedResponse<T>(items, total, page, pageSize);
    }

    private bool TryGetUserId(out int userId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out userId);
    }
}
