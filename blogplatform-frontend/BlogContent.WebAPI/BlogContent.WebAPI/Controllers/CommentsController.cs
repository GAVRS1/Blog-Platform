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
public class CommentsController : ControllerBase
{
    private readonly CommentService _commentService;

    public CommentsController(CommentService commentService) => _commentService = commentService;

    [HttpGet("post/{postId}")]
    public IActionResult GetByPostId(int postId) => Ok(_commentService.GetCommentsByPostId(postId));

    [HttpPost]
    public IActionResult Create([FromBody] CommentDto dto)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

        var comment = new Comment
        {
            Content = dto.Content,
            PostId = dto.PostId,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _commentService.CreateComment(comment);
        return CreatedAtAction(nameof(GetByPostId), new { postId = dto.PostId }, comment);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        _commentService.DeleteComment(id);
        return NoContent();
    }
}