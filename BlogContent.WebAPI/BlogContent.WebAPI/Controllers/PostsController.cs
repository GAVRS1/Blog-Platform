using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using BlogContent.Services;
using BlogContent.WebAPI.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogContent.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PostsController : ControllerBase
{
    private readonly PostService _postService;

    public PostsController(PostService postService) => _postService = postService;

    [HttpGet]
    public IActionResult GetAll() => Ok(_postService.GetAllPosts());

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var post = _postService.GetPostById(id);
        return post == null ? NotFound() : Ok(post);
    }

    [HttpGet("user/{userId}")]
    public IActionResult GetByUserId(int userId) => Ok(_postService.GetPostsByUser(userId));

    [HttpPost]
    public IActionResult Create([FromBody] PostDto dto)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

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
}