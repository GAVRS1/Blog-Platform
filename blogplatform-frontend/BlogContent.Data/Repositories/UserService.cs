using BlogContent.Core.Exceptions;
using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;

namespace BlogContent.Data.Repositories;

public class UserService(BlogContext context) : IUserService
{
    private readonly UserRepository _userRepository = new(context);

    public User GetUserById(int id)
    {
        User user = _userRepository.GetUserById(id);
        if (user == null)
            throw new UserNotFoundException("Пользователь не найден.");
        return user;
    }

    public User GetUserByEmail(string email) => _userRepository.GetUserByEmail(email);

    public void CreateUser(User user)
    {
        if (_userRepository.GetUserByEmail(user.Email) != null)
            throw new Exception("Пользователь с такой почтой уже существует.");

        _userRepository.CreateUser(user);
    }

    public void UpdateUser(User user) => _userRepository.UpdateUser(user);

    public void DeleteUser(int id)
    {
        User user = _userRepository.GetUserById(id);
        if (user == null)
            throw new UserNotFoundException("Пользователь не найден.");
        _userRepository.DeleteUser(id);
    }

    public void BanUser(int userId)
    {
        User user = GetUserById(userId);
        _userRepository.BanUser(userId);
    }

    public void UnbanUser(int userId)
    {
        User user = GetUserById(userId);
        _userRepository.UnbanUser(userId);
    }

    public void MakeAdmin(int userId)
    {
        User user = GetUserById(userId);
        _userRepository.MakeAdmin(userId);
    }
}