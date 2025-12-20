using BlogContent.Core.Models;

namespace BlogContent.Core.Interfaces;

public interface IPostRepository
{
    Post GetPostById(int id);
    IEnumerable<Post> GetPostsById(IEnumerable<int> postIds);
    IEnumerable<Post> GetAllPostsWithUsers();
    PagedResult<Post> GetPostsByUser(int userId, int page, int pageSize);
    PagedResult<Post> GetAllPosts(int page, int pageSize);
    void CreatePost(Post post);
    void UpdatePost(Post post);
    void DeletePost(int id);
}
