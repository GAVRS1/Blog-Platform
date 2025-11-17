using BlogContent.Core.Models;
using BlogContent.Services;
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
    private readonly LikeService _likeService;
    private readonly CommentService _commentService;

    public LikesController(LikeService likeService, CommentService commentService)
    {
        _likeService = likeService;
        _commentService = commentService;
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
