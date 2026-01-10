using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using System.Collections.Generic;
using System.Linq;

namespace BlogContent.Services;

public class BlockService : IBlockService
{
    private readonly IBlockRepository _blockRepository;

    public BlockService(IBlockRepository blockRepository)
    {
        _blockRepository = blockRepository;
    }

    public Block CreateBlock(Block block)
    {
        var existing = _blockRepository.GetActiveBlock(block.BlockerUserId, block.BlockedUserId);
        if (existing != null)
        {
            return existing;
        }

        _blockRepository.CreateBlock(block);
        return block;
    }

    public bool RemoveBlock(int blockerUserId, int blockedUserId)
    {
        var existing = _blockRepository.GetActiveBlock(blockerUserId, blockedUserId);
        if (existing == null)
        {
            return false;
        }

        existing.IsActive = false;
        existing.UnblockedAt = DateTime.UtcNow;
        _blockRepository.UpdateBlock(existing);
        return true;
    }

    public IEnumerable<Block> GetBlocks(int blockerUserId) =>
        _blockRepository.GetBlocksByUser(blockerUserId);

    public IReadOnlyCollection<int> GetBlockedUserIds(int userId)
    {
        var blockedByMe = _blockRepository.GetBlocksByUser(userId)
            .Where(b => b.IsActive)
            .Select(b => b.BlockedUserId);
        var blockedMe = _blockRepository.GetBlocksAgainstUser(userId)
            .Where(b => b.IsActive)
            .Select(b => b.BlockerUserId);

        return blockedByMe
            .Concat(blockedMe)
            .Distinct()
            .ToList();
    }

    public (bool IBlocked, bool BlockedMe) GetRelationship(int userId, int otherUserId)
    {
        var iBlocked = _blockRepository.GetActiveBlock(userId, otherUserId) != null;
        var blockedMe = _blockRepository.GetActiveBlock(otherUserId, userId) != null;
        return (iBlocked, blockedMe);
    }
}
