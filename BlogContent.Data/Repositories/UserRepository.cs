using BlogContent.Core.Enums;
using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using Microsoft.EntityFrameworkCore;

namespace BlogContent.Data.Repositories;

public class UserRepository(BlogContext context) : IUserRepository
{
    private readonly BlogContext _context = context;

    // Получить пользователя по ID (с профилем)
    public User GetUserById(int id)
    {
        return _context.Users
            .Include(u => u.Profile)
            .AsNoTracking()
            .FirstOrDefault(u => u.Id == id);
    }

    // Получить нескольких пользователей по айдишникам
    public IEnumerable<User> GetUsersByIds(IEnumerable<int> userIds)
    {
        return _context.Users
            .Include(u => u.Profile)
            .Where(u => userIds.Contains(u.Id))
            .AsNoTracking()
            .ToList();
    }

    // Получить пользователя по email
    public User GetUserByEmail(string email)
    {
        return _context.Users
            .AsNoTracking()
            .FirstOrDefault(u => u.Email == email);
    }

    // Получить пользователя по username
    public User GetUserByUsername(string username)
    {
        var normalized = username?.Trim().ToLower();
        return _context.Users
            .Include(u => u.Profile)
            .AsNoTracking()
            .FirstOrDefault(u => u.Username.Trim().ToLower() == normalized);
    }

    // Поиск пользователей по username/email с пагинацией
    public PagedResult<User> SearchUsers(string query, int page, int pageSize)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        if (string.IsNullOrWhiteSpace(query))
            return new PagedResult<User>(Enumerable.Empty<User>(), 0, page, pageSize);

        var normalized = query.Trim().ToLower();
        var usersQuery = _context.Users
            .Include(u => u.Profile)
            .AsNoTracking()
            .Where(u => u.Username.Trim().ToLower().Contains(normalized) || u.Email.Trim().ToLower().Contains(normalized));

        var total = usersQuery.Count();
        var items = usersQuery
            .OrderBy(u => u.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return new PagedResult<User>(items, total, page, pageSize);
    }

    // Создать нового пользователя
    public void CreateUser(User user)
    {
        _context.Users.Add(user);
        _context.SaveChanges();
    }

    // Обновить данные пользователя
    public void UpdateUser(User user)
    {
        _context.Users.Update(user);
        _context.SaveChanges();
    }

    // Удалить пользователя
    public void DeleteUser(int id)
    {
        User? user = _context.Users.Find(id);
        if (user != null)
        {
            _context.Users.Remove(user);
            _context.SaveChanges();
        }
    }

    // Забанить пользователя
    public void BanUser(int userId)
    {
        var user = GetUserById(userId);
        user.Status = UserStatus.Banned;
        _context.SaveChanges();
    }

    // Разбанить пользователя
    public void UnbanUser(int userId)
    {
        var user = GetUserById(userId);
        user.Status = UserStatus.Active;
        _context.SaveChanges();
    }

    // Назначить администратором
    public void MakeAdmin(int userId)
    {
        var user = GetUserById(userId);
        user.Status = UserStatus.Admin;
        _context.SaveChanges();
    }
}
