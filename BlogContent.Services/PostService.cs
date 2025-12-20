using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;

namespace BlogContent.Services;

public class PostService : IPostService
{
    private readonly IPostRepository _postRepository;
    private readonly ILikeRepository _likeRepository;
    private readonly ICommentRepository _commentRepository;

    public PostService(IPostRepository postRepository, ILikeRepository likeRepository, ICommentRepository commentRepository)
    {
        _postRepository = postRepository;
        _likeRepository = likeRepository;
        _commentRepository = commentRepository;
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
