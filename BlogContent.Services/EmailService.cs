using System.Net;
using System.Net.Mail;
using BlogContent.Core.Interfaces;
using BlogContent.Services.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace BlogContent.Services;

public class EmailService : IEmailService
{
    private readonly EmailOptions _options;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<EmailOptions> options, ILogger<EmailService> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        if (!string.IsNullOrWhiteSpace(_options.SendGridApiKey))
        {
            await SendWithSendGridAsync(to, subject, body, cancellationToken);
            return;
        }

        await SendWithSmtpAsync(to, subject, body, cancellationToken);
    }

    private async Task SendWithSmtpAsync(string to, string subject, string body, CancellationToken cancellationToken)
    {
        using var client = new SmtpClient(_options.SmtpHost, _options.SmtpPort)
        {
            EnableSsl = _options.UseSsl
        };

        if (!string.IsNullOrWhiteSpace(_options.SmtpUser) && !string.IsNullOrWhiteSpace(_options.SmtpPassword))
        {
            client.Credentials = new NetworkCredential(_options.SmtpUser, _options.SmtpPassword);
        }

        using var message = new MailMessage(_options.Sender, to, subject, body);

        try
        {
            await client.SendMailAsync(message, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email via SMTP to {Recipient}", to);
            throw;
        }
    }

    private Task SendWithSendGridAsync(string to, string subject, string body, CancellationToken cancellationToken)
    {
        // For this context we avoid bringing SendGrid dependency. Simulate SendGrid path by logging.
        _logger.LogInformation("SendGrid is configured. Sending email to {Recipient} with subject {Subject}", to, subject);
        return SendWithSmtpAsync(to, subject, body, cancellationToken);
    }
}
