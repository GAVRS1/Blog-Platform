using BlogContent.Core.Models;

namespace BlogContent.Core.Interfaces;

public interface ICommentService
{
    Comment GetCommentById(int id);
    IEnumerable<Comment> GetCommentsByPostId(int postId);
    IEnumerable<Comment> GetCommentsByUserId(int userId);
    void CreateComment(Comment comment);
    void UpdateComment(Comment comment);
    void DeleteComment(int id);
}