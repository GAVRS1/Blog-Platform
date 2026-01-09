using System.Collections.Generic;
using BlogContent.Core.Models;

namespace BlogContent.Core.Interfaces;

public interface IFollowRepository
{
    bool IsFollowing(int followerUserId, int targetUserId);
    void AddFollow(Follow follow);
    void RemoveFollow(int followerUserId, int targetUserId);
    IEnumerable<int> GetFollowerIds(int userId);
    IEnumerable<int> GetFollowingIds(int userId);
    int GetFollowersCount(int userId);
    int GetFollowingCount(int userId);
}
