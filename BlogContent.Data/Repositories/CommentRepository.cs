using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using Microsoft.EntityFrameworkCore;

namespace BlogContent.Data.Repositories;

public class CommentRepository(BlogContext context) : ICommentRepository
{
    private readonly BlogContext _context = context;

    // Получить комментарий по ID
    public Comment GetCommentById(int id) => _context.Comments
            .Include(c => c.User)
            .FirstOrDefault(c => c.Id == id);

    // Получить комментарии по ID поста (с сортировкой)
    public PagedResult<Comment> GetCommentsByPostId(int postId, int page, int pageSize)
    {
        var query = _context.Comments
            .Include(c => c.User)
            .Where(c => c.PostId == postId)
            .OrderByDescending(c => c.CreatedAt)
            .AsQueryable();

        var totalCount = query.Count();
        var items = query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return new PagedResult<Comment>(items, totalCount);
    }

    // Получить комментарии по ID поста с информацией о пользователях
    public IEnumerable<Comment> GetCommentsByPostIdWithUsers(int postId)
    {
        return _context.Comments
            .Include(c => c.User)
                .ThenInclude(u => u.Profile)
            .Where(c => c.PostId == postId)
            .ToList();
    }

    // Получить комментарии пользователя
    public IEnumerable<Comment> GetCommentsByUserId(int userId) =>
        _context.Comments
            .Include(c => c.Post)
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.CreatedAt)
            .ToList();

    // Создать новый комментарий
    public void CreateComment(Comment comment)
    {
        _context.Comments.Add(comment);
        _context.SaveChanges();
    }

    // Обновить комментарий
    public void UpdateComment(Comment comment)
    {
        _context.Comments.Update(comment);
        _context.SaveChanges();
    }

    // Удалить комментарий
    public void DeleteComment(int id)
    {
        Comment? comment = _context.Comments.Find(id);
        if (comment != null)
        {
            _context.Comments.Remove(comment);
            _context.SaveChanges();
        }
    }

    // Получить лайки комментария
    public IEnumerable<CommentLike> GetLikesByCommentId(int commentId)
    {
        return _context.CommentLikes
            .Include(cl => cl.User)
            .Where(cl => cl.CommentId == commentId)
            .ToList();
    }

    // Добавить лайк к комментарию
    public void AddCommentLike(CommentLike like)
    {
        _context.CommentLikes.Add(like);
        _context.SaveChanges();
    }

    // Удалить лайк
    public void RemoveCommentLike(int likeId)
    {
        var like = _context.CommentLikes.Find(likeId);
        if (like != null)
        {
            _context.CommentLikes.Remove(like);
            _context.SaveChanges();
        }
    }

    // Добавить ответ на комментарий
    public void AddReply(CommentReply reply)
    {
        _context.CommentReplies.Add(reply);
        _context.SaveChanges();
    }

    // Получить ответы на комментарий
    public PagedResult<CommentReply> GetRepliesByCommentId(int commentId, int page, int pageSize)
    {
        var query = _context.CommentReplies
            .Include(r => r.User)
            .Where(r => r.CommentId == commentId)
            .OrderBy(r => r.CreatedAt)
            .AsQueryable();

        var totalCount = query.Count();
        var items = query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return new PagedResult<CommentReply>(items, totalCount);
    }

    // Получить лайк пользователя для комментария
    public CommentLike GetCommentLike(int commentId, int userId)
    {
        return _context.CommentLikes
            .FirstOrDefault(cl => cl.CommentId == commentId && cl.UserId == userId);
    }

    // Получить все лайки комментария
    public IEnumerable<CommentLike> GetCommentLikesByCommentId(int commentId)
    {
        return _context.CommentLikes
            .Include(cl => cl.User)
            .Where(cl => cl.CommentId == commentId)
            .ToList();
    }

    // Получить ответы на комментарий
    public IEnumerable<CommentReply> GetCommentReplies(int commentId)
    {
        return _context.CommentReplies
            .Include(r => r.User)
            .Where(r => r.CommentId == commentId)
            .OrderBy(r => r.CreatedAt)
            .ToList();
    }

    // Получить комментарий
    public Comment GetCommentByIdWithDetails(int id)
    {
        return _context.Comments
            .Include(c => c.User)
            .Include(c => c.Likes)
            .Include(c => c.Replies)
                .ThenInclude(r => r.User)
            .FirstOrDefault(c => c.Id == id);
    }

    // Получить комментарии поста с деталями
    public IEnumerable<Comment> GetCommentsByPostIdWithDetails(int postId)
    {
        return _context.Comments
            .Include(c => c.User)
            .Include(c => c.Likes)
            .Include(c => c.Replies)
                .ThenInclude(r => r.User)
            .Where(c => c.PostId == postId)
            .ToList();
    }

    // Добавить лайк
    public CommentLike AddCommentLikeWithReturn(CommentLike like)
    {
        _context.CommentLikes.Add(like);
        _context.SaveChanges();
        return like;
    }

    // Добавить ответ и вернуть его
    public CommentReply AddReplyWithReturn(CommentReply reply)
    {
        _context.CommentReplies.Add(reply);
        _context.SaveChanges();
        return reply;
    }
}