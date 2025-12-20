using BlogContent.Core.Models;

namespace BlogContent.Core.Interfaces;

public interface IUserRepository
{
    User GetUserById(int id);
    IEnumerable<User> GetUsersByIds(IEnumerable<int> userIds);
    User GetUserByEmail(string email);
    void CreateUser(User user);
    void UpdateUser(User user);
    void DeleteUser(int id);
    void BanUser(int userId);
    void UnbanUser(int userId);
    void MakeAdmin(int userId);
}
