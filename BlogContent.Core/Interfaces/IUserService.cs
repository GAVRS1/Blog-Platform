using BlogContent.Core.Models;

namespace BlogContent.Core.Interfaces;

public interface IUserService
{
    User GetUserById(int id);
    IEnumerable<User> GetUsersByIds(IEnumerable<int> userIds);
    User GetUserByEmail(string email);
    User GetUserByUsername(string username);
    PagedResult<User> SearchUsers(string query, int page, int pageSize);
    void CreateUser(User user);
    void UpdateUser(User user);
    void DeleteUser(int id);
    void BanUser(int userId);
    void UnbanUser(int userId);
    void MakeAdmin(int userId);
    User? GetCurrentUser();
}
