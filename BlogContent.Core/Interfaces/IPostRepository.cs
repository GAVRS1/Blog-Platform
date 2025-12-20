using BlogContent.Core.Models;

namespace BlogContent.Core.Interfaces;

public interface IPostRepository
{
    Post GetPostById(int id);
    IEnumerable<Post> GetPostsById(IEnumerable<int> postIds);
    IEnumerable<Post> GetAllPostsWithUsers();
    IEnumerable<Post> GetPostsByUser(int userId);
    IEnumerable<Post> GetAllPosts();
    void CreatePost(Post post);
    void UpdatePost(Post post);
    void DeletePost(int id);
}
