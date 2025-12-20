using BlogContent.Core.Models;

namespace BlogContent.Core.Interfaces;

public interface IAuthService
{
    User? Login(string email, string password);
    bool UserExists(string email);
}
