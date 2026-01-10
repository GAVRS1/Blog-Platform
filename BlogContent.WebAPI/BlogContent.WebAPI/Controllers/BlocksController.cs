using System.Security.Claims;
using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using BlogContent.WebAPI.DTOs;
using BlogContent.WebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogContent.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BlocksController : ControllerBase
{
    private readonly IBlockService _blockService;
    private readonly IFollowService _followService;
    private readonly IUserService _userService;

    public BlocksController(IBlockService blockService, IFollowService followService, IUserService userService)
    {
        _blockService = blockService;
        _followService = followService;
        _userService = userService;
    }

    [HttpPost("block")]
    public IActionResult Block([FromBody] BlockUserRequest request)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        if (request.TargetUserId == currentUserId)
        {
            return BadRequest("Нельзя заблокировать самого себя.");
        }

        var block = new Block
        {
            BlockerUserId = currentUserId,
            BlockedUserId = request.TargetUserId,
            Reason = request.Reason,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        var result = _blockService.CreateBlock(block);
        _followService.Unfollow(currentUserId, request.TargetUserId);
        _followService.Unfollow(request.TargetUserId, currentUserId);

        return Ok(new BlockDto
        {
            Id = result.Id,
            BlockerUserId = result.BlockerUserId,
            BlockedUserId = result.BlockedUserId,
            Reason = result.Reason,
            IsActive = result.IsActive,
            CreatedAt = result.CreatedAt,
            UnblockedAt = result.UnblockedAt
        });
    }

    [HttpPost("unblock")]
    public IActionResult Unblock([FromBody] UnblockUserRequest request)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var removed = _blockService.RemoveBlock(currentUserId, request.TargetUserId);
        if (!removed)
        {
            return NotFound();
        }

        return Ok(new { unblocked = true });
    }

    [HttpGet("list")]
    public IActionResult List()
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var blocks = _blockService.GetBlocks(currentUserId)
            .Where(block => block.IsActive)
            .Select(block =>
            {
                var user = block.BlockedUser ?? _userService.GetUserById(block.BlockedUserId);
                return new BlockedUserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Profile = user.Profile == null
                        ? null
                        : new PublicUserProfileDto
                        {
                            FullName = user.Profile.FullName,
                            ProfilePictureUrl = user.Profile.ProfilePictureUrl
                        },
                    Reason = block.Reason,
                    CreatedAt = block.CreatedAt
                };
            })
            .ToList();

        return Ok(blocks);
    }

    [HttpGet("relationship/{otherUserId}")]
    public IActionResult Relationship(int otherUserId)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var relation = _blockService.GetRelationship(currentUserId, otherUserId);
        return Ok(new { iBlocked = relation.IBlocked, blockedMe = relation.BlockedMe });
    }

    private bool TryGetUserId(out int userId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out userId);
    }
}
