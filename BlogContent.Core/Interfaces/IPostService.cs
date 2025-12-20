using BlogContent.Core.Models;

namespace BlogContent.Core.Interfaces;

public interface IPostService
{
    Post GetPostById(int id);
    IEnumerable<Post> GetAllPostsWithUsers();
    IEnumerable<Post> GetPostsById(IEnumerable<int> postIds);
    PagedResult<Post> GetPostsByUser(int userId, int page, int pageSize);
    PagedResult<Post> GetAllPosts(int page, int pageSize);
    void CreatePost(Post post);
    void UpdatePost(Post post);
    void DeletePost(int id);
    void AddLike(int postId, int userId);
    void RemoveLike(int postId, int userId);
    void AddComment(Comment comment);
}