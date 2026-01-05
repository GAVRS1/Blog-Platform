using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using BlogContent.Core.Models;

namespace BlogContent.WebAPI.Services;

public class InMemoryFollowService : IFollowService
{
    private readonly ConcurrentDictionary<int, HashSet<int>> _following = new();
    private readonly object _lock = new();

    public void Follow(int followerId, int targetUserId)
    {
        if (followerId <= 0 || targetUserId <= 0 || followerId == targetUserId)
        {
            return;
        }

        lock (_lock)
        {
            var following = _following.GetOrAdd(followerId, _ => []);
            following.Add(targetUserId);
        }
    }

    public void Unfollow(int followerId, int targetUserId)
    {
        if (followerId <= 0 || targetUserId <= 0)
        {
            return;
        }

        lock (_lock)
        {
            if (_following.TryGetValue(followerId, out var following))
            {
                following.Remove(targetUserId);
            }
        }
    }

    public PagedResult<int> GetFollowers(int userId, int page, int pageSize)
    {
        var followers = GetFollowersInternal(userId).ToList();
        var pageItems = followers.Skip((page - 1) * pageSize).Take(pageSize);
        return new PagedResult<int>(pageItems, followers.Count, page, pageSize);
    }

    public PagedResult<int> GetFollowing(int userId, int page, int pageSize)
    {
        var following = GetFollowingInternal(userId).ToList();
        var pageItems = following.Skip((page - 1) * pageSize).Take(pageSize);
        return new PagedResult<int>(pageItems, following.Count, page, pageSize);
    }

    public FollowRelationship GetRelationship(int viewerUserId, int otherUserId)
    {
        var iFollow = GetFollowingInternal(viewerUserId).Contains(otherUserId);
        var followsMe = GetFollowingInternal(otherUserId).Contains(viewerUserId);
        return new FollowRelationship(iFollow, followsMe, iFollow && followsMe);
    }

    public FollowCounters GetCounters(int userId)
    {
        var followers = GetFollowersInternal(userId).Count();
        var following = GetFollowingInternal(userId).Count();
        return new FollowCounters(followers, following);
    }

    private IEnumerable<int> GetFollowersInternal(int userId)
    {
        lock (_lock)
        {
            return _following
                .Where(x => x.Value.Contains(userId))
                .Select(x => x.Key)
                .OrderBy(x => x)
                .ToList();
        }
    }

    private IEnumerable<int> GetFollowingInternal(int userId)
    {
        lock (_lock)
        {
            return _following.TryGetValue(userId, out var following)
                ? following.OrderBy(x => x).ToList()
                : Enumerable.Empty<int>();
        }
    }
}
