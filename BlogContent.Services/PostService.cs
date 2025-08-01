using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using BlogContent.Data.Repositories;
using BlogContent.Data;
namespace BlogContent.Services;

public class PostService : IPostService
{
    private readonly PostRepository _postRepository;
    private readonly LikeRepository _likeRepository;
    private readonly CommentRepository _commentRepository;

    public PostService(BlogContext context)
    {
        _postRepository = new PostRepository(context);
        _likeRepository = new LikeRepository(context);
        _commentRepository = new CommentRepository(context);
    }

    public Post GetPostById(int id) => _postRepository.GetPostById(id);

    public IEnumerable<Post> GetAllPostsWithUsers() => _postRepository.GetAllPostsWithUsers();
    public IEnumerable<Post> GetPostsById(IEnumerable<int> postIds) => _postRepository.GetPostsById(postIds);
    public IEnumerable<Post> GetPostsByUser(int userId) => _postRepository.GetPostsByUser(userId);
    public IEnumerable<Post> GetAllPosts() => _postRepository.GetAllPosts();

    public void CreatePost(Post post) => _postRepository.CreatePost(post);
    public void UpdatePost(Post post) => _postRepository.UpdatePost(post);
    public void DeletePost(int id) => _postRepository.DeletePost(id);
    public void AddLike(int postId, int userId)
    {
        Like existingLike = _likeRepository.GetLikeByPostAndUser(postId, userId);
        if (existingLike == null)
        {
            Like like = new Like
            {
                PostId = postId,
                UserId = userId
            };
            _likeRepository.CreateLike(like);
        }
    }

    public void RemoveLike(int postId, int userId)
    {
        Like like = _likeRepository.GetLikeByPostAndUser(postId, userId);
        if (like != null)
            _likeRepository.DeleteLike(like.Id);
    }

    public void AddComment(Comment comment)
    {
        if (comment.CreatedAt == default)
            comment.CreatedAt = DateTime.Now;

        _commentRepository.CreateComment(comment);
    }
}