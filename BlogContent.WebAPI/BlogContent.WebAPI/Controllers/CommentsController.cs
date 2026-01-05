using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
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

    private readonly ICommentService _commentService;

    public CommentsController(ICommentService commentService) => _commentService = commentService;

    [HttpGet("post/{postId}")]
    public IActionResult GetByPostId(int postId, [FromQuery] int page = 1, [FromQuery] int pageSize = DefaultPageSize)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        (page, pageSize) = NormalizePagination(page, pageSize);
        var comments = _commentService.GetCommentsByPostId(postId, page, pageSize);
        return Ok(ToPagedResponse(comments, page, pageSize, userId));
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
        var saved = _commentService.GetCommentByIdWithDetails(comment.Id) ?? comment;
        return CreatedAtAction(nameof(GetByPostId), new { postId = dto.PostId }, saved.ToResponseDto(userId));
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
        return Ok(saved.ToResponseDto());
    }

    [HttpGet("{commentId}/replies")]
    public IActionResult GetReplies(int commentId, [FromQuery] int page = 1, [FromQuery] int pageSize = DefaultPageSize)
    {
        (page, pageSize) = NormalizePagination(page, pageSize);
        var replies = _commentService.GetRepliesByCommentId(commentId, page, pageSize);
        return Ok(ToPagedResponse(replies, page, pageSize));
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        _commentService.DeleteComment(id);
        return NoContent();
    }

    private static PagedResponse<CommentReplyResponseDto> ToPagedResponse(PagedResult<CommentReply> source, int page, int pageSize) =>
        new(source.Items.Select(r => r.ToResponseDto()), source.TotalCount, page, pageSize);

    private static PagedResponse<CommentResponseDto> ToPagedResponse(PagedResult<Comment> source, int page, int pageSize, int currentUserId) =>
        new(source.Items.Select(c => c.ToResponseDto(currentUserId)), source.TotalCount, page, pageSize);

    private static (int Page, int PageSize) NormalizePagination(int page, int pageSize)
    {
        var normalizedPage = Math.Max(page, 1);
        var normalizedPageSize = Math.Clamp(pageSize, 1, MaxPageSize);

        return (normalizedPage, normalizedPageSize);
    }

    private bool TryGetUserId(out int userId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out userId);
    }
}
