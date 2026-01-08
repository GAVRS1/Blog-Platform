using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using Microsoft.EntityFrameworkCore;

namespace BlogContent.Data.Repositories;

public class BlockRepository(BlogContext context) : IBlockRepository
{
    private readonly BlogContext _context = context;

    public Block? GetActiveBlock(int blockerUserId, int blockedUserId) =>
        _context.Blocks
            .Include(b => b.BlockerUser)
            .Include(b => b.BlockedUser)
            .FirstOrDefault(b => b.BlockerUserId == blockerUserId
                && b.BlockedUserId == blockedUserId
                && b.IsActive);

    public IEnumerable<Block> GetBlocksByUser(int blockerUserId) =>
        _context.Blocks
            .Include(b => b.BlockedUser)
            .Where(b => b.BlockerUserId == blockerUserId)
            .OrderByDescending(b => b.CreatedAt)
            .AsNoTracking()
            .ToList();

    public IEnumerable<Block> GetBlocksAgainstUser(int blockedUserId) =>
        _context.Blocks
            .Include(b => b.BlockerUser)
            .Where(b => b.BlockedUserId == blockedUserId && b.IsActive)
            .AsNoTracking()
            .ToList();

    public void CreateBlock(Block block)
    {
        _context.Blocks.Add(block);
        _context.SaveChanges();
    }

    public void UpdateBlock(Block block)
    {
        _context.Blocks.Update(block);
        _context.SaveChanges();
    }
}
