namespace BlogContent.Services.Options;

public class EmailTemplateOptions
{
    public string VerificationSubject { get; set; } = "Email verification code";
    public string VerificationBodyTemplate { get; set; } = "Your verification code: {CODE}";
}
