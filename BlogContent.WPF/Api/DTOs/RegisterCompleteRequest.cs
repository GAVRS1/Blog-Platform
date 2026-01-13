namespace BlogContent.WebAPI.DTOs;

public class RegisterCompleteRequest
{
    public Guid TemporaryKey { get; set; }
    public string Password { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateTime? BirthDate { get; set; }
    public string? Bio { get; set; }
    public string? ProfilePictureUrl { get; set; }
}
