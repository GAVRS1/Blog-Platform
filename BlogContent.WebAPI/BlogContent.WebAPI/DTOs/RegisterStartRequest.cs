namespace BlogContent.WebAPI.DTOs;

public class RegisterStartRequest
{
    public string Email { get; set; } = string.Empty;
    public string TurnstileToken { get; set; } = string.Empty;
}
