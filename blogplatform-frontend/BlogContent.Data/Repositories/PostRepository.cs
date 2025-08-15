using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using Microsoft.EntityFrameworkCore;

namespace BlogContent.Data.Repositories;

public class PostRepository(BlogContext context) : IPostService
{
    private readonly BlogContext _context = context;

    public Post GetPostById(int id)
    {
        return _context.Posts
            .Include(p => p.User)
            .Include(p => p.Comments)
                .ThenInclude(c => c.User)
            .Include(p => p.Likes)
                .ThenInclude(l => l.User)
            .FirstOrDefault(p => p.Id == id);
    }

    // Получить посты по списку ID
    public IEnumerable<Post> GetPostsById(IEnumerable<int> postIds)
    {
        return _context.Posts
            .Include(p => p.User)
            .Include(p => p.Comments)
                .ThenInclude(c => c.User)
            .Include(p => p.Likes)
                .ThenInclude(l => l.User)
            .Where(p => postIds.Contains(p.Id))
            .ToList();
    }
    public IEnumerable<Post> GetAllPostsWithUsers()
    {
        return _context.Posts
            .Include(p => p.User)
                .ThenInclude(u => u.Profile)
            .Include(p => p.Comments)
                .ThenInclude(c => c.User)
                    .ThenInclude(u => u.Profile)
            .Include(p => p.Likes)
                .ThenInclude(l => l.User)
                    .ThenInclude(u => u.Profile)
            .OrderByDescending(p => p.CreatedAt)
            .ToList();
    }
    public IEnumerable<Post> GetPostsByUser(int userId)
    {
        return _context.Posts
            .Include(p => p.User)
            .Include(p => p.Comments)
                .ThenInclude(c => c.User)
            .Include(p => p.Likes)
                .ThenInclude(l => l.User)
            .Where(p => p.UserId == userId)
            .ToList();
    }

    public void CreatePost(Post post)
    {
        _context.Posts.Add(post);
        _context.SaveChanges();
    }

    public void UpdatePost(Post post)
    {
        _context.Posts.Update(post);
        _context.SaveChanges();
    }

    public void DeletePost(int id)
    {
        Post? post = _context.Posts.Find(id);
        if (post != null)
        {
            var likes = _context.Likes.Where(l => l.PostId == id);
            var comments = _context.Comments.Where(c => c.PostId == id);

            _context.Likes.RemoveRange(likes);
            _context.Comments.RemoveRange(comments);
            _context.Posts.Remove(post);

            _context.SaveChanges();
        }
    }

    public IEnumerable<Post> GetAllPosts()
    {
        return _context.Posts
            .Include(p => p.User)
            .Include(p => p.Comments)
                .ThenInclude(c => c.User)
            .Include(p => p.Likes)
                .ThenInclude(l => l.User)
            .OrderByDescending(p => p.CreatedAt)
            .ToList();
    }
}