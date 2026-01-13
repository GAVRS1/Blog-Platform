using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using BlogContent.Core.Enums;
using BlogContent.Services;
using BlogContent.WebAPI.DTOs;
using BlogContent.WebAPI.Services;
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

    private const string AccessDeniedMessage = "Пользователь ограничил круг лиц, которым доступно это действие.";
    private const string BlockedMessage = "Доступ ограничен из-за блокировки пользователя.";

    private readonly ICommentService _commentService;
    private readonly IPostService _postService;
    private readonly IFollowService _followService;
    private readonly ISettingsService _settingsService;
    private readonly INotificationService _notificationService;
    private readonly IBlockService _blockService;

    public CommentsController(
        ICommentService commentService,
        IPostService postService,
        IFollowService followService,
        ISettingsService settingsService,
        INotificationService notificationService,
        IBlockService blockService)
    {
        _commentService = commentService;
        _postService = postService;
        _followService = followService;
        _settingsService = settingsService;
        _notificationService = notificationService;
        _blockService = blockService;
    }

    [HttpGet("post/{postId}")]
    public IActionResult GetByPostId(int postId, [FromQuery] int page = 1, [FromQuery] int pageSize = DefaultPageSize)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var post = _postService.GetPostById(postId);
        if (post == null)
        {
            return NotFound();
        }

        if (post.UserId != userId)
        {
            var blockRelation = _blockService.GetRelationship(userId, post.UserId);
            if (blockRelation.IBlocked || blockRelation.BlockedMe)
            {
                return StatusCode(403, new AccessDeniedResponse { Message = BlockedMessage });
            }
        }

        (page, pageSize) = NormalizePagination(page, pageSize);
        var comments = _commentService.GetCommentsByPostId(postId, page, pageSize);
        return Ok(ToPagedResponse(comments, page, pageSize, userId));
    }

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var comment = _commentService.GetCommentByIdWithDetails(id);
        if (comment == null)
        {
            return NotFound();
        }

        return Ok(comment.ToResponseDto(userId));
    }

    [HttpPost]
    public IActionResult Create([FromBody] CommentDto dto)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var post = _postService.GetPostById(dto.PostId);
        if (post == null)
        {
            return NotFound();
        }

        if (post.UserId != userId)
        {
            var blockRelation = _blockService.GetRelationship(userId, post.UserId);
            if (blockRelation.IBlocked || blockRelation.BlockedMe)
            {
                return StatusCode(403, new AccessDeniedResponse { Message = BlockedMessage });
            }

            var relation = _followService.GetRelationship(userId, post.UserId);
            var audience = post.User?.PrivacySettings?.CanCommentFrom ?? Audience.Everyone;
            if (!SettingsAccessChecker.CanAccess(audience, relation.AreFriends))
            {
                return StatusCode(403, new AccessDeniedResponse { Message = AccessDeniedMessage });
            }
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

        if (post.UserId != userId)
        {
            var settings = _settingsService.GetNotificationSettings(post.UserId);
            if (settings.OnComments)
            {
                _notificationService.AddNotification(
                    post.UserId,
                    "comment",
                    "Новый комментарий к вашему посту.",
                    userId,
                    "post",
                    dto.PostId.ToString());
            }
        }

        return CreatedAtAction(nameof(GetByPostId), new { postId = dto.PostId }, saved.ToResponseDto(userId));
    }

    [HttpPost("{commentId}/reply")]
    public IActionResult Reply(int commentId, [FromBody] ReplyDto dto)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var comment = _commentService.GetCommentById(commentId);
        if (comment == null)
        {
            return NotFound();
        }

        if (comment.UserId != userId)
        {
            var blockRelation = _blockService.GetRelationship(userId, comment.UserId);
            if (blockRelation.IBlocked || blockRelation.BlockedMe)
            {
                return StatusCode(403, new AccessDeniedResponse { Message = BlockedMessage });
            }

            var relation = _followService.GetRelationship(userId, comment.UserId);
            var audience = comment.User?.PrivacySettings?.CanCommentFrom ?? Audience.Everyone;
            if (!SettingsAccessChecker.CanAccess(audience, relation.AreFriends))
            {
                return StatusCode(403, new AccessDeniedResponse { Message = AccessDeniedMessage });
            }
        }

        var reply = new CommentReply
        {
            CommentId = commentId,
            Content = dto.Content,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        var saved = _commentService.AddReplyWithReturn(reply);

        if (comment.UserId != userId)
        {
            var settings = _settingsService.GetNotificationSettings(comment.UserId);
            if (settings.OnComments)
            {
                _notificationService.AddNotification(
                    comment.UserId,
                    "reply",
                    "Новый ответ на ваш комментарий.",
                    userId,
                    "comment",
                    commentId.ToString());
            }
        }

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
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var comment = _commentService.GetCommentById(id);
        if (comment == null)
        {
            return NotFound();
        }

        var post = _postService.GetPostById(comment.PostId);
        if (post == null)
        {
            return NotFound();
        }

        if (comment.UserId != currentUserId && post.UserId != currentUserId)
        {
            return StatusCode(403);
        }

        _commentService.DeleteComment(id);
        return NoContent();
    }

    [HttpDelete("reply/{replyId}")]
    public IActionResult DeleteReply(int replyId)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var reply = _commentService.GetReplyById(replyId);
        if (reply == null)
        {
            return NotFound();
        }

        var postOwnerId = reply.Comment?.Post?.UserId;
        if (postOwnerId == null)
        {
            return NotFound();
        }

        if (reply.UserId != currentUserId && postOwnerId != currentUserId)
        {
            return StatusCode(403);
        }

        _commentService.DeleteReply(replyId);
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
