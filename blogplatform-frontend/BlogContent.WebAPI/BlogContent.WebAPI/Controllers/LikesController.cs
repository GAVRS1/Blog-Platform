using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using BlogContent.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogContent.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LikesController : ControllerBase
{
    private readonly LikeService _likeService;

    public LikesController(LikeService likeService) => _likeService = likeService;

    [HttpPost("post/{postId}")]
    public IActionResult LikePost(int postId)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

        var existing = _likeService.GetLikeByPostAndUser(postId, userId);
        if (existing != null)
        {
            _likeService.DeleteLike(existing.Id);
            return Ok(new { Liked = false });
        }

        var like = new Like { PostId = postId, UserId = userId };
        _likeService.CreateLike(like);
        return Ok(new { Liked = true });
    }

    [HttpGet("post/{postId}")]
    public IActionResult GetLikesByPost(int postId) => Ok(_likeService.GetLikesByPostId(postId));
}