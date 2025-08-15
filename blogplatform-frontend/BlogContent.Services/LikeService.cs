using BlogContent.Core.Models;
using BlogContent.Data.Repositories;
using BlogContent.Data;
namespace BlogContent.Services;

public class LikeService
{
    private readonly LikeRepository _likeRepository;

    public LikeService(BlogContext context) => _likeRepository = new LikeRepository(context);

    public Like GetLikeById(int id) => _likeRepository.GetLikeById(id);
    public Like GetLikeByPostAndUser(int postId, int userId) => _likeRepository.GetLikeByPostAndUser(postId, userId);

    public IEnumerable<Like> GetLikesByUserId(int userId) => _likeRepository.GetLikesByUserId(userId);
    public IEnumerable<Like> GetLikesByPostId(int postId) => _likeRepository.GetLikesByPostId(postId);

    public void CreateLike(Like like) => _likeRepository.CreateLike(like);
    public void DeleteLike(int id) => _likeRepository.DeleteLike(id);
}