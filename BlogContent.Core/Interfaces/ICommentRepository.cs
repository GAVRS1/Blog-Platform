using BlogContent.Core.Models;

namespace BlogContent.Core.Interfaces;

public interface ICommentRepository
{
    Comment GetCommentById(int id);
    Comment GetCommentByIdWithDetails(int id);
    IEnumerable<Comment> GetCommentsByPostId(int postId);
    IEnumerable<Comment> GetCommentsByPostIdWithDetails(int postId);
    IEnumerable<Comment> GetCommentsByPostIdWithUsers(int postId);
    IEnumerable<Comment> GetCommentsByUserId(int userId);
    IEnumerable<CommentLike> GetLikesByCommentId(int commentId);
    IEnumerable<CommentLike> GetCommentLikesByCommentId(int commentId);
    IEnumerable<CommentReply> GetCommentReplies(int commentId);
    IEnumerable<CommentReply> GetRepliesByCommentId(int commentId);
    CommentLike GetCommentLike(int commentId, int userId);
    void AddCommentLike(CommentLike like);
    CommentLike AddCommentLikeWithReturn(CommentLike like);
    void RemoveCommentLike(int likeId);
    void AddReply(CommentReply reply);
    CommentReply AddReplyWithReturn(CommentReply reply);
    void CreateComment(Comment comment);
    void UpdateComment(Comment comment);
    void DeleteComment(int id);
}
