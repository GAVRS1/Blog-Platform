using BlogContent.Core.Interfaces;
using BlogContent.Data;
using BlogContent.Data.Repositories;
using BlogContent.Services;
using BlogContent.Services.Options;
using BlogContent.WebAPI.Hubs;
using BlogContent.WebAPI.Authorization;
using BlogContent.WebAPI.Middleware;
using BlogContent.WebAPI.Options;
using BlogContent.WebAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IO;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Diagnostics;

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

        builder.Services.AddDbContext<BlogContext>(options =>
            options.UseNpgsql(connectionString)
                .ConfigureWarnings(warnings => warnings.Ignore(RelationalEventId.PendingModelChangesWarning)));

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

        var redisConnectionString = builder.Configuration.GetSection("Redis").GetValue<string>("ConnectionString");
        if (string.IsNullOrWhiteSpace(redisConnectionString))
        {
            redisConnectionString = "localhost:6379";
            Console.WriteLine(
                "WARNING: 'Redis:ConnectionString' configuration is missing. " +
                "Using default localhost:6379 connection.");
        }

        builder.Services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = redisConnectionString;
            options.InstanceName = "BlogContent:";
        });

        builder.Services.AddSession(options =>
        {
            options.IdleTimeout = TimeSpan.FromMinutes(30);
            options.Cookie.HttpOnly = true;
            options.Cookie.IsEssential = true;
        });

        // JWT
        var jwtSection = builder.Configuration.GetRequiredSection("Jwt");
        var jwtOptions = jwtSection.Get<JwtOptions>() ?? throw new InvalidOperationException("JWT configuration is missing.");
        jwtOptions.Validate();
        builder.Services.Configure<JwtOptions>(jwtSection);

        builder.Services.Configure<EmailOptions>(builder.Configuration.GetSection("Email"));
        builder.Services.Configure<EmailTemplateOptions>(builder.Configuration.GetSection("EmailTemplates"));
        builder.Services.Configure<EmailVerificationOptions>(builder.Configuration.GetSection("EmailVerification"));
        builder.Services.Configure<MediaStorageOptions>(builder.Configuration.GetSection("MediaStorage"));
        builder.Services.Configure<TurnstileOptions>(builder.Configuration.GetSection("Turnstile"));
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
        builder.Services.AddAuthorization(options =>
        {
            options.AddPolicy("AdminOnly", policy =>
                policy.Requirements.Add(new AdminRequirement()));
        });
        builder.Services.AddScoped<IAuthorizationHandler, AdminRequirementHandler>();

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

        builder.Services.AddHttpClient<ITurnstileService, TurnstileService>();

        builder.Services.Configure<ForwardedHeadersOptions>(options =>
        {
            options.ForwardedHeaders = ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost;
            options.KnownNetworks.Clear();
            options.KnownProxies.Clear();
        });

        var app = builder.Build();

        using (var scope = app.Services.CreateScope())
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<BlogContext>();

            dbContext.Database.Migrate();
        }

        app.UseForwardedHeaders();

        if (!app.Environment.IsDevelopment())
        {
            app.UseHttpsRedirection();
        }

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

        app.UseSession();
        app.UseAuthentication();
        app.UseMiddleware<BlockedUserMiddleware>();
        app.UseAuthorization();

        // ✅ Современный маппинг вместо UseEndpoints
        app.MapControllers();
        app.MapHub<ChatHub>("/hubs/chat");
        app.MapHub<NotificationsHub>("/hubs/notifications");

        app.Run();
    }
}
