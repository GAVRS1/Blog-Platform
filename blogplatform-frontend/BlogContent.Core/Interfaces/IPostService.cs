using BlogContent.Core.Models;

namespace BlogContent.Core.Interfaces;

public interface IPostService
{
    Post GetPostById(int id);
    IEnumerable<Post> GetPostsById(IEnumerable<int> postIds);
    IEnumerable<Post> GetPostsByUser(int userId);
    IEnumerable<Post> GetAllPosts();
    void CreatePost(Post post);
    void UpdatePost(Post post);
    void DeletePost(int id);
}