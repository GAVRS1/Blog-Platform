using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using Microsoft.EntityFrameworkCore;

namespace BlogContent.Data.Repositories;

public class FollowRepository(BlogContext context) : IFollowRepository
{
    private readonly BlogContext _context = context;

    public bool IsFollowing(int followerUserId, int targetUserId) =>
        _context.Follows.Any(f => f.FollowerUserId == followerUserId && f.TargetUserId == targetUserId);

    public void AddFollow(Follow follow)
    {
        _context.Follows.Add(follow);
        _context.SaveChanges();
    }

    public void RemoveFollow(int followerUserId, int targetUserId)
    {
        var follow = _context.Follows
            .FirstOrDefault(f => f.FollowerUserId == followerUserId && f.TargetUserId == targetUserId);

        if (follow == null)
        {
            return;
        }

        _context.Follows.Remove(follow);
        _context.SaveChanges();
    }

    public IEnumerable<int> GetFollowerIds(int userId) =>
        _context.Follows
            .Where(f => f.TargetUserId == userId)
            .OrderBy(f => f.FollowerUserId)
            .Select(f => f.FollowerUserId)
            .AsNoTracking()
            .ToList();

    public IEnumerable<int> GetFollowingIds(int userId) =>
        _context.Follows
            .Where(f => f.FollowerUserId == userId)
            .OrderBy(f => f.TargetUserId)
            .Select(f => f.TargetUserId)
            .AsNoTracking()
            .ToList();

    public int GetFollowersCount(int userId) =>
        _context.Follows.Count(f => f.TargetUserId == userId);

    public int GetFollowingCount(int userId) =>
        _context.Follows.Count(f => f.FollowerUserId == userId);
}
