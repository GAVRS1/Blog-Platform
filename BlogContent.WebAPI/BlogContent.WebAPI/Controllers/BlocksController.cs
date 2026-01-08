using System.Security.Claims;
using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using BlogContent.WebAPI.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogContent.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BlocksController : ControllerBase
{
    private readonly IBlockService _blockService;

    public BlocksController(IBlockService blockService)
    {
        _blockService = blockService;
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
            .Select(block => new BlockDto
            {
                Id = block.Id,
                BlockerUserId = block.BlockerUserId,
                BlockedUserId = block.BlockedUserId,
                Reason = block.Reason,
                IsActive = block.IsActive,
                CreatedAt = block.CreatedAt,
                UnblockedAt = block.UnblockedAt
            });

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
