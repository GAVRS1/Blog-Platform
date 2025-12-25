namespace BlogContent.WebAPI.DTOs;

public class RegisterVerifyRequest
{
    public Guid TemporaryKey { get; set; }
    public string Code { get; set; } = string.Empty;
}
