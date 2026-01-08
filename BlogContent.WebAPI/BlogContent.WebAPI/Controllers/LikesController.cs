using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using BlogContent.WebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Security.Claims;

namespace BlogContent.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LikesController : ControllerBase
{
    private readonly ILikeService _likeService;
    private readonly ICommentService _commentService;
    private readonly IPostService _postService;
    private readonly ISettingsService _settingsService;
    private readonly INotificationService _notificationService;

    public LikesController(
        ILikeService likeService,
        ICommentService commentService,
        IPostService postService,
        ISettingsService settingsService,
        INotificationService notificationService)
    {
        _likeService = likeService;
        _commentService = commentService;
        _postService = postService;
        _settingsService = settingsService;
        _notificationService = notificationService;
    }

    [HttpPost("post/{postId}")]
    public IActionResult LikePost(int postId)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var existing = _likeService.GetLikeByPostAndUser(postId, userId);
        var liked = existing == null;

        if (existing != null)
        {
            _likeService.DeleteLike(existing.Id);
        }
        else
        {
            var like = new Like { PostId = postId, UserId = userId };
            _likeService.CreateLike(like);

            var post = _postService.GetPostById(postId);
            if (post != null && post.UserId != userId)
            {
                var settings = _settingsService.GetNotificationSettings(post.UserId);
                if (settings.OnLikes)
                {
                    _notificationService.AddNotification(
                        post.UserId,
                        "like",
                        "Новый лайк вашему посту.",
                        userId,
                        "post",
                        postId.ToString());
                }
            }
        }

        var count = _likeService.GetLikesByPostId(postId).Count();
        return Ok(new { liked, count });
    }

    [HttpPost("comment/{commentId}")]
    public IActionResult LikeComment(int commentId)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var existing = _commentService.GetCommentLike(commentId, userId);
        var liked = existing == null;

        if (existing != null)
        {
            _commentService.RemoveCommentLike(existing.Id);
        }
        else
        {
            var like = new CommentLike { CommentId = commentId, UserId = userId };
            _commentService.AddCommentLike(like);

            var comment = _commentService.GetCommentById(commentId);
            if (comment != null && comment.UserId != userId)
            {
                var settings = _settingsService.GetNotificationSettings(comment.UserId);
                if (settings.OnLikes)
                {
                    _notificationService.AddNotification(
                        comment.UserId,
                        "like",
                        "Новый лайк вашему комментарию.",
                        userId,
                        "comment",
                        commentId.ToString());
                }
            }
        }

        var count = _commentService.GetLikesByCommentId(commentId).Count();
        return Ok(new { liked, count });
    }

    [HttpGet("post/{postId}")]
    public IActionResult GetLikesByPost(int postId) => Ok(_likeService.GetLikesByPostId(postId));

    private bool TryGetUserId(out int userId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out userId);
    }
}
