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
public class CommentsController : ControllerBase
{
    private const int DefaultPageSize = 10;
    private const int MaxPageSize = 100;

    private readonly CommentService _commentService;

    public CommentsController(CommentService commentService) => _commentService = commentService;

    [HttpGet("post/{postId}")]
    public IActionResult GetByPostId(int postId, [FromQuery] int page = 1, [FromQuery] int pageSize = DefaultPageSize)
    {
        var comments = _commentService.GetCommentsByPostId(postId).ToList();
        return Ok(ToPagedResponse(comments, page, pageSize));
    }

    [HttpPost]
    public IActionResult Create([FromBody] CommentDto dto)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

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

    [HttpPost("{commentId}/reply")]
    public IActionResult Reply(int commentId, [FromBody] ReplyDto dto)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var reply = new CommentReply
        {
            CommentId = commentId,
            Content = dto.Content,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        var saved = _commentService.AddReplyWithReturn(reply);
        return Ok(saved);
    }

    [HttpGet("{commentId}/replies")]
    public IActionResult GetReplies(int commentId, [FromQuery] int page = 1, [FromQuery] int pageSize = DefaultPageSize)
    {
        var replies = _commentService.GetRepliesByCommentId(commentId).ToList();
        return Ok(ToPagedResponse(replies, page, pageSize));
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        _commentService.DeleteComment(id);
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
