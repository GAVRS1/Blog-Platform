using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using Microsoft.EntityFrameworkCore;

namespace BlogContent.Data.Repositories;

public class LikeRepository(BlogContext context) : ILikeRepository
{
    private readonly BlogContext _context = context;

    // Получить конкретный лайк по ID
    public Like GetLikeById(int id) => _context.Likes.FirstOrDefault(l => l.Id == id);

    // Получить все лайки пользователя
    public IEnumerable<Like> GetLikesByUserId(int userId) =>
        _context.Likes
            .Include(l => l.Post)
            .Where(l => l.UserId == userId)
            .ToList();

    // Получить все лайки для поста
    public IEnumerable<Like> GetLikesByPostId(int postId) =>
        _context.Likes
            .Include(l => l.User)
            .Where(l => l.PostId == postId)
            .ToList();

    // Получить лайк по посту и пользователю
    public Like GetLikeByPostAndUser(int postId, int userId) =>
        _context.Likes.FirstOrDefault(l => l.PostId == postId && l.UserId == userId);

    public void CreateLike(Like like)
    {
        _context.Likes.Add(like);
        _context.SaveChanges();
    }

    public void DeleteLike(int id)
    {
        Like? like = _context.Likes.Find(id);
        if (like != null)
        {
            _context.Likes.Remove(like);
            _context.SaveChanges();
        }
    }
}