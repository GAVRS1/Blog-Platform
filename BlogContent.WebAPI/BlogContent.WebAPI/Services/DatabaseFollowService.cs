using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;

namespace BlogContent.WebAPI.Services;

public class DatabaseFollowService : IFollowService
{
    private readonly IFollowRepository _followRepository;

    public DatabaseFollowService(IFollowRepository followRepository)
    {
        _followRepository = followRepository;
    }

    public void Follow(int followerId, int targetUserId)
    {
        if (followerId <= 0 || targetUserId <= 0 || followerId == targetUserId)
        {
            return;
        }

        if (_followRepository.IsFollowing(followerId, targetUserId))
        {
            return;
        }

        _followRepository.AddFollow(new Follow
        {
            FollowerUserId = followerId,
            TargetUserId = targetUserId,
            CreatedAt = DateTime.UtcNow
        });
    }

    public void Unfollow(int followerId, int targetUserId)
    {
        if (followerId <= 0 || targetUserId <= 0)
        {
            return;
        }

        _followRepository.RemoveFollow(followerId, targetUserId);
    }

    public PagedResult<int> GetFollowers(int userId, int page, int pageSize)
    {
        var followers = _followRepository.GetFollowerIds(userId).ToList();
        var pageItems = followers.Skip((page - 1) * pageSize).Take(pageSize);
        return new PagedResult<int>(pageItems, followers.Count, page, pageSize);
    }

    public PagedResult<int> GetFollowing(int userId, int page, int pageSize)
    {
        var following = _followRepository.GetFollowingIds(userId).ToList();
        var pageItems = following.Skip((page - 1) * pageSize).Take(pageSize);
        return new PagedResult<int>(pageItems, following.Count, page, pageSize);
    }

    public FollowRelationship GetRelationship(int viewerUserId, int otherUserId)
    {
        var iFollow = _followRepository.IsFollowing(viewerUserId, otherUserId);
        var followsMe = _followRepository.IsFollowing(otherUserId, viewerUserId);
        return new FollowRelationship(iFollow, followsMe, iFollow && followsMe);
    }

    public FollowCounters GetCounters(int userId)
    {
        var followers = _followRepository.GetFollowersCount(userId);
        var following = _followRepository.GetFollowingCount(userId);
        return new FollowCounters(followers, following);
    }
}
