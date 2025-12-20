using BlogContent.Core.Models;

namespace BlogContent.Core.Interfaces;

public interface ICommentService
{
    Comment GetCommentById(int id);
    Comment GetCommentByIdWithDetails(int id);
    PagedResult<Comment> GetCommentsByPostId(int postId, int page, int pageSize);
    IEnumerable<Comment> GetCommentsByPostIdWithDetails(int postId);
    IEnumerable<Comment> GetCommentsByPostIdWithUsers(int postId);
    IEnumerable<Comment> GetCommentsByUserId(int userId);
    void CreateComment(Comment comment);
    void UpdateComment(Comment comment);
    void DeleteComment(int id);
    IEnumerable<CommentLike> GetLikesByCommentId(int commentId);
    PagedResult<CommentReply> GetRepliesByCommentId(int commentId, int page, int pageSize);
    IEnumerable<CommentReply> GetCommentReplies(int commentId);
    CommentLike GetCommentLike(int commentId, int userId);
    void AddCommentLike(CommentLike like);
    void RemoveCommentLike(int likeId);
    void AddReply(int commentId, string content, int userId);
    CommentLike CreateCommentLike(CommentLike like);
    CommentReply AddReplyWithReturn(CommentReply reply);
}