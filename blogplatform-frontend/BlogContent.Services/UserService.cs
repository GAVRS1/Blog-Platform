using BlogContent.Core.Enums;
using BlogContent.Core.Exceptions;
using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using BlogContent.Data;
using BlogContent.Data.Repositories;

namespace BlogContent.Services;

public class UserService : IUserService
{
    private readonly UserRepository _userRepository;

    public UserService(BlogContext context) => _userRepository = new UserRepository(context);

    public IEnumerable<User> GetUsersByIds(IEnumerable<int> userIds) => _userRepository.GetUsersByIds(userIds);

    public User GetUserById(int id) => _userRepository.GetUserById(id);

    public User GetUserByEmail(string email) => _userRepository.GetUserByEmail(email);

    public void CreateUser(User user) => _userRepository.CreateUser(user);

    public void UpdateUser(User user) => _userRepository.UpdateUser(user);

    public void DeleteUser(int id) => _userRepository.DeleteUser(id);

    public void BanUser(int userId) => _userRepository.BanUser(userId);

    public void UnbanUser(int userId) => _userRepository.UnbanUser(userId);

    public void MakeAdmin(int userId) => _userRepository.MakeAdmin(userId);

    public User? GetCurrentUser() => null;
}