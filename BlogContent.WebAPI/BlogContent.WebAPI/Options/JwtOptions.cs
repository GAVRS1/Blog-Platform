namespace BlogContent.WebAPI.Options;

public class JwtOptions
{
    public string? Issuer { get; init; }
    public string? Audience { get; init; }
    public string? Key { get; init; }

    public void Validate()
    {
        if (string.IsNullOrWhiteSpace(Issuer))
            throw new InvalidOperationException("JWT Issuer is not configured. Set 'Jwt:Issuer' in configuration or environment variables.");

        if (string.IsNullOrWhiteSpace(Audience))
            throw new InvalidOperationException("JWT Audience is not configured. Set 'Jwt:Audience' in configuration or environment variables.");

        if (string.IsNullOrWhiteSpace(Key))
            throw new InvalidOperationException("JWT Key is not configured. Set 'Jwt:Key' in configuration or environment variables.");
    }
}
