using System.Collections.Generic;
using BlogContent.Core.Models;

namespace BlogContent.WebAPI.Services;

public record FollowRelationship(bool IFollow, bool FollowsMe, bool AreFriends);

public record FollowCounters(int Followers, int Following);

public interface IFollowService
{
    void Follow(int followerId, int targetUserId);
    void Unfollow(int followerId, int targetUserId);
    PagedResult<int> GetFollowers(int userId, int page, int pageSize);
    PagedResult<int> GetFollowing(int userId, int page, int pageSize);
    FollowRelationship GetRelationship(int viewerUserId, int otherUserId);
    FollowCounters GetCounters(int userId);
}
