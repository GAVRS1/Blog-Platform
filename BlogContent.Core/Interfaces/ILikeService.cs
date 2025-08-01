using BlogContent.Core.Models;

namespace BlogContent.Core.Interfaces;

public interface ILikeService
{
    Like GetLikeById(int id);
    IEnumerable<Like> GetLikesByUserId(int userId);
    IEnumerable<Like> GetLikesByPostId(int postId);
    Like GetLikeByPostAndUser(int postId, int userId);
    void CreateLike(Like like);
    void DeleteLike(int id);
}