using BlogContent.Core.Models;

namespace BlogContent.Core.Interfaces;

public interface IBlockService
{
    Block CreateBlock(Block block);
    bool RemoveBlock(int blockerUserId, int blockedUserId);
    IEnumerable<Block> GetBlocks(int blockerUserId);
    IReadOnlyCollection<int> GetBlockedUserIds(int userId);
    (bool IBlocked, bool BlockedMe) GetRelationship(int userId, int otherUserId);
}
