using BlogContent.Core.Interfaces;
using BlogContent.Data;
using BlogContent.Data.Repositories;
using BlogContent.Services;
using BlogContent.Services.Options;
using BlogContent.WebAPI.Hubs;
using BlogContent.WebAPI.Options;
using BlogContent.WebAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IO;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace BlogContent.WebAPI;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // DB
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "Connection string 'DefaultConnection' is not configured. " +
                "Provide it in appsettings.json or via environment variable 'ConnectionStrings__DefaultConnection'.");
        }

        builder.Services.AddDbContext<BlogContext>(options => options.UseNpgsql(connectionString));

        // Repositories
        builder.Services.AddScoped<IPostRepository, PostRepository>();
        builder.Services.AddScoped<IUserRepository, UserRepository>();
        builder.Services.AddScoped<ICommentRepository, CommentRepository>();
        builder.Services.AddScoped<ILikeRepository, LikeRepository>();
        builder.Services.AddScoped<IEmailVerificationRepository, EmailVerificationRepository>();
        builder.Services.AddScoped<ISettingsRepository, SettingsRepository>();
        builder.Services.AddScoped<IReportRepository, ReportRepository>();
        builder.Services.AddScoped<IModerationActionRepository, ModerationActionRepository>();
        builder.Services.AddScoped<IAppealRepository, AppealRepository>();
        builder.Services.AddScoped<IBlockRepository, BlockRepository>();
        builder.Services.AddScoped<IFollowRepository, FollowRepository>();
        builder.Services.AddScoped<IMessageRepository, MessageRepository>();

        // Services (через интерфейсы)
        builder.Services.AddScoped<IPostService, PostService>();
        builder.Services.AddScoped<IUserService, UserService>();
        builder.Services.AddScoped<ICommentService, CommentService>();
        builder.Services.AddScoped<ILikeService, LikeService>();
        builder.Services.AddScoped<IEmailService, EmailService>();
        builder.Services.AddScoped<IEmailVerificationService, EmailVerificationService>();
        builder.Services.AddScoped<IAuthService, AuthService>();
        builder.Services.AddScoped<ISettingsService, SettingsService>();
        builder.Services.AddScoped<IModerationService, ModerationService>();
        builder.Services.AddScoped<IBlockService, BlockService>();
        builder.Services.AddScoped<IMediaStorageService, LocalMediaStorageService>();
        builder.Services.AddScoped<IFollowService, DatabaseFollowService>();
        builder.Services.AddScoped<IMessageService, DatabaseMessageService>();
        builder.Services.AddScoped<INotificationService, DatabaseNotificationService>();
        builder.Services.AddSignalR();

        // JWT
        var jwtSection = builder.Configuration.GetRequiredSection("Jwt");
        var jwtOptions = jwtSection.Get<JwtOptions>() ?? throw new InvalidOperationException("JWT configuration is missing.");
        jwtOptions.Validate();
        builder.Services.Configure<JwtOptions>(jwtSection);

        builder.Services.Configure<EmailOptions>(builder.Configuration.GetSection("Email"));
        builder.Services.Configure<EmailTemplateOptions>(builder.Configuration.GetSection("EmailTemplates"));
        builder.Services.Configure<EmailVerificationOptions>(builder.Configuration.GetSection("EmailVerification"));
        builder.Services.Configure<MediaStorageOptions>(builder.Configuration.GetSection("MediaStorage"));
        builder.Services.PostConfigure<MediaStorageOptions>(options => options.EnsureDefaults());

        var mediaStorageOptions = new MediaStorageOptions();
        builder.Configuration.GetSection("MediaStorage").Bind(mediaStorageOptions);
        mediaStorageOptions.EnsureDefaults();
        builder.Services.Configure<FormOptions>(options =>
        {
            options.MultipartBodyLengthLimit = mediaStorageOptions.GetMaxAllowedSize();
        });

        var key = Encoding.UTF8.GetBytes(jwtOptions.Key);
        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtOptions.Issuer,
                    ValidAudience = jwtOptions.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(key)
                };

                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;

                        if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                        {
                            context.Token = accessToken;
                        }

                        return Task.CompletedTask;
                    }
                };
            });

        var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
        if (allowedOrigins.Length == 0)
        {
            allowedOrigins = new[]
            {
                "http://localhost:5173",
                "https://blogplatform-frontend.netlify.app",
                "https://contentplatform.netlify.app"
            };

            Console.WriteLine(
                "WARNING: 'Cors:AllowedOrigins' configuration is missing. " +
                "Using default origins for local development and Netlify preview.");
        }

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("FrontendPolicy", policy =>
            {
                policy.WithOrigins(allowedOrigins)
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials();
            });
        });

        builder.Services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            });

        var app = builder.Build();

        // Ensure database schema is up-to-date before handling requests
        using (var scope = app.Services.CreateScope())
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<BlogContext>();

            dbContext.Database.Migrate();
            dbContext.Database.ExecuteSqlRaw("ALTER TABLE \"Posts\" ADD COLUMN IF NOT EXISTS \"AudioUrl\" text");
        }

        // ✅ Swagger удалён полностью

        app.UseHttpsRedirection();

        var storageOptions = app.Services.GetRequiredService<IOptions<MediaStorageOptions>>().Value;
        var webRootPath = app.Environment.WebRootPath ?? Path.Combine(app.Environment.ContentRootPath, "wwwroot");
        var uploadsRoot = Path.Combine(webRootPath, storageOptions.UploadsFolder);
        Directory.CreateDirectory(uploadsRoot);

        app.UseStaticFiles();
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(uploadsRoot),
            RequestPath = storageOptions.NormalizedRequestPath
        });

        app.UseRouting();
        app.UseCors("FrontendPolicy");

        app.UseAuthentication();
        app.UseAuthorization();

        // ✅ Современный маппинг вместо UseEndpoints
        app.MapControllers();
        app.MapHub<ChatHub>("/hubs/chat");
        app.MapHub<NotificationsHub>("/hubs/notifications");

        app.Run();
    }
}
