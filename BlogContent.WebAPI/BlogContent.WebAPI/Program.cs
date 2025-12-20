using BlogContent.Core.Interfaces;
using BlogContent.Data;
using BlogContent.Data.Repositories;
using BlogContent.Services;
using BlogContent.WebAPI.Options;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Text;

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

        // Services (через интерфейсы)
        builder.Services.AddScoped<IPostService, PostService>();
        builder.Services.AddScoped<IUserService, UserService>();
        builder.Services.AddScoped<ICommentService, CommentService>();
        builder.Services.AddScoped<ILikeService, LikeService>();
        builder.Services.AddScoped<IAuthService, AuthService>();

        // JWT
        var jwtSection = builder.Configuration.GetRequiredSection("Jwt");
        var jwtOptions = jwtSection.Get<JwtOptions>() ?? throw new InvalidOperationException("JWT configuration is missing.");
        jwtOptions.Validate();
        builder.Services.Configure<JwtOptions>(jwtSection);

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
            });

        var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
        if (allowedOrigins.Length == 0)
        {
            allowedOrigins = new[]
            {
                "http://localhost:5173",
                "https://blogplatform-frontend.netlify.app"
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
            });
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        var app = builder.Build();

        // Ensure database schema is up-to-date before handling requests
        using (var scope = app.Services.CreateScope())
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<BlogContext>();

            dbContext.Database.Migrate();
            dbContext.Database.ExecuteSqlRaw("ALTER TABLE \"Posts\" ADD COLUMN IF NOT EXISTS \"AudioUrl\" text");
        }

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();

        // Enable routing so the CORS middleware can process preflight requests
        // before they reach the controllers.
        app.UseRouting();
        app.UseCors("FrontendPolicy");

        app.UseAuthentication();
        app.UseAuthorization();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });
        app.Run();
    }
}
