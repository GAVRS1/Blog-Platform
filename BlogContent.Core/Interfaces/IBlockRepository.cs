using BlogContent.Core.Models;

namespace BlogContent.Core.Interfaces;

public interface IBlockRepository
{
    Block? GetActiveBlock(int blockerUserId, int blockedUserId);
    IEnumerable<Block> GetBlocksByUser(int blockerUserId);
    IEnumerable<Block> GetBlocksAgainstUser(int blockedUserId);
    void CreateBlock(Block block);
    void UpdateBlock(Block block);
}
