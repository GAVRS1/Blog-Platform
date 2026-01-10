using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;

namespace BlogContent.Services;

public class CommentService : ICommentService
{
    private readonly ICommentRepository _commentRepository;

    public CommentService(ICommentRepository commentRepository)
    {
        _commentRepository = commentRepository;
    }

    public PagedResult<Comment> GetCommentsByPostId(int postId, int page, int pageSize)
    {
        (page, pageSize) = NormalizePagination(page, pageSize);
        return _commentRepository.GetCommentsByPostId(postId, page, pageSize);
    }
    public IEnumerable<Comment> GetCommentsByUserId(int userId) => _commentRepository.GetCommentsByUserId(userId);
    public IEnumerable<CommentLike> GetLikesByCommentId(int commentId) => _commentRepository.GetLikesByCommentId(commentId);
    public IEnumerable<Comment> GetCommentsByPostIdWithDetails(int postId) => _commentRepository.GetCommentsByPostIdWithDetails(postId);
    public IEnumerable<Comment> GetCommentsByPostIdWithUsers(int postId) => _commentRepository.GetCommentsByPostIdWithUsers(postId);
    public IEnumerable<CommentReply> GetCommentReplies(int commentId) => _commentRepository.GetCommentReplies(commentId);
    public CommentReply GetReplyById(int replyId) => _commentRepository.GetReplyById(replyId);
    public PagedResult<CommentReply> GetRepliesByCommentId(int commentId, int page, int pageSize)
    {
        (page, pageSize) = NormalizePagination(page, pageSize);
        return _commentRepository.GetRepliesByCommentId(commentId, page, pageSize);
    }

    public void AddCommentLike(CommentLike like) => _commentRepository.AddCommentLike(like);
    public void RemoveCommentLike(int likeId) => _commentRepository.RemoveCommentLike(likeId);
    public void AddReply(CommentReply reply) => _commentRepository.AddReply(reply);
    public void CreateComment(Comment comment) => _commentRepository.CreateComment(comment);
    public void UpdateComment(Comment comment) => _commentRepository.UpdateComment(comment);
    public void DeleteComment(int id) => _commentRepository.DeleteComment(id);
    public void DeleteReply(int replyId) => _commentRepository.DeleteReply(replyId);

    public void LikeComment(int commentId, int userId)
    {
        CommentLike existingLike = _commentRepository.GetCommentLike(commentId, userId);
        if (existingLike == null)
        {
            CommentLike like = new CommentLike
            {
                CommentId = commentId,
                UserId = userId
            };
            _commentRepository.AddCommentLike(like);
        }
    }

    public void UnlikeComment(int commentId, int userId)
    {
        CommentLike like = _commentRepository.GetCommentLike(commentId, userId);
        if (like != null)
            _commentRepository.RemoveCommentLike(like.Id);
    }

    public void AddReply(int commentId, string content, int userId)
    {
        CommentReply reply = new CommentReply
        {
            CommentId = commentId,
            Content = content,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };
        _commentRepository.AddReply(reply);
    }

    public Comment GetCommentWithReplies(int commentId) => _commentRepository.GetCommentByIdWithDetails(commentId);
    public CommentLike GetCommentLike(int commentId, int userId) => _commentRepository.GetCommentLike(commentId, userId);
    public Comment GetCommentByIdWithDetails(int id) => _commentRepository.GetCommentByIdWithDetails(id);
    public Comment GetCommentById(int id) => _commentRepository.GetCommentById(id);

    public CommentLike CreateCommentLike(CommentLike like)
    {
        _commentRepository.AddCommentLike(like);
        return like;
    }

    public CommentReply AddReplyWithReturn(CommentReply reply)
    {
        return _commentRepository.AddReplyWithReturn(reply);
    }

    private static (int Page, int PageSize) NormalizePagination(int page, int pageSize)
    {
        var normalizedPage = Math.Max(page, 1);
        var normalizedPageSize = Math.Max(pageSize, 1);

        return (normalizedPage, normalizedPageSize);
    }
}
