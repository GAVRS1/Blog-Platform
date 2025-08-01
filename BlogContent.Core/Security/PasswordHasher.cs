using System.Text;
using System.Security.Cryptography;

namespace BlogContent.Core.Security;

public static class PasswordHasher
{
    private const string Salt = "Hello_Word!";

    public static string HashPassword(string password)
    {
        string saltedPassword = password + Salt;
        byte[] bytes = SHA256.HashData(Encoding.UTF8.GetBytes(saltedPassword));
        return Convert.ToBase64String(bytes);
    }

    public static bool VerifyPassword(string inputPassword, string hashedPassword) => HashPassword(inputPassword) == hashedPassword;
}