namespace BlogContent.Services.Options;

public class EmailVerificationOptions
{
    public int CodeLength { get; set; } = 6;
    public int CodeTTLMinutes { get; set; } = 10;
    public int MaxAttempts { get; set; } = 5;
    public int MaxResends { get; set; } = 3;
    public int ResendCooldownSeconds { get; set; } = 60;
}
