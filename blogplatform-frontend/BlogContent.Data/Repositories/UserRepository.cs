using BlogContent.Core.Enums;
using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using Microsoft.EntityFrameworkCore;

namespace BlogContent.Data.Repositories;

public class UserRepository(BlogContext context) : IUserService
{
    private readonly BlogContext _context = context;

    // Получить пользователя по ID (с профилем)
    public User GetUserById(int id)
    {
        return _context.Users
            .Include(u => u.Profile)
            .FirstOrDefault(u => u.Id == id);
    }

    // Получить нескольких пользователей по айдишникам
    public IEnumerable<User> GetUsersByIds(IEnumerable<int> userIds)
    {
        return _context.Users
            .Include(u => u.Profile)
            .Where(u => userIds.Contains(u.Id))
            .ToList();
    }

    // Получить пользователя по email
    public User GetUserByEmail(string email)
    {
        return _context.Users.FirstOrDefault(u => u.Email == email);
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