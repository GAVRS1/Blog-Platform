using Microsoft.EntityFrameworkCore;
using BlogContent.Core.Models;
namespace BlogContent.Data;

public class BlogContext : DbContext
{
    public BlogContext()
    {
    }

    public BlogContext(DbContextOptions<BlogContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<Like> Likes { get; set; }
    public DbSet<Profile> Profiles { get; set; }
    public DbSet<CommentLike> CommentLikes { get; set; }
    public DbSet<CommentReply> CommentReplies { get; set; }
    public DbSet<EmailVerification> EmailVerifications { get; set; }
    public DbSet<PostMedia> PostMedias { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Profile>()
            .Property(p => p.BirthDate)
            .HasColumnType("date");

        modelBuilder.Entity<User>()
            .HasOne(u => u.Profile)
            .WithOne(p => p.User)
            .HasForeignKey<Profile>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<User>()
            .Property(u => u.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        modelBuilder.Entity<User>()
            .Property(u => u.EmailConfirmed)
            .HasDefaultValue(false);

        modelBuilder.Entity<Post>()
            .Property(p => p.CreatedAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        modelBuilder.Entity<Post>()
            .HasMany(p => p.Comments)
            .WithOne(c => c.Post)
            .HasForeignKey(c => c.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Post>()
            .HasMany(p => p.Likes)
            .WithOne(l => l.Post)
            .HasForeignKey(l => l.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Post>()
            .HasMany(p => p.Media)
            .WithOne(m => m.Post)
            .HasForeignKey(m => m.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Comment>()
            .Property(c => c.CreatedAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        modelBuilder.Entity<Comment>()
            .HasOne(c => c.User)
            .WithMany(u => u.Comments)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Comment>()
            .HasMany(c => c.Likes)
            .WithOne(cl => cl.Comment)
            .HasForeignKey(cl => cl.CommentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Comment>()
            .HasMany(c => c.Replies)
            .WithOne(r => r.Comment)
            .HasForeignKey(r => r.CommentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CommentLike>()
            .HasOne(cl => cl.User)
            .WithMany(u => u.CommentLikes)
            .HasForeignKey(cl => cl.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<CommentReply>()
            .HasOne(r => r.User)
            .WithMany(u => u.CommentReplies)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Like>()
            .HasOne(l => l.User)
            .WithMany(u => u.Likes)
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Post>()
            .Property(p => p.ContentType)
            .HasConversion<string>()
            .HasMaxLength(20);

        modelBuilder.Entity<PostMedia>()
            .Property(m => m.Type)
            .HasConversion<string>()
            .HasMaxLength(20);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Post>()
            .HasIndex(p => p.UserId);

        modelBuilder.Entity<Comment>()
            .HasIndex(c => c.PostId);

        modelBuilder.Entity<CommentLike>()
            .HasIndex(cl => new { cl.CommentId, cl.UserId })
            .IsUnique();

        modelBuilder.Entity<CommentReply>()
            .HasIndex(r => r.CommentId);

        modelBuilder.Entity<EmailVerification>()
            .Property(ev => ev.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        modelBuilder.Entity<EmailVerification>()
            .Property(ev => ev.Purpose)
            .HasConversion<string>()
            .HasMaxLength(20);

        modelBuilder.Entity<EmailVerification>()
            .HasIndex(ev => ev.Email);

        modelBuilder.Entity<EmailVerification>()
            .HasIndex(ev => ev.TemporaryKey)
            .IsUnique();

        modelBuilder.Entity<PostMedia>()
            .HasIndex(m => m.PostId);
    }
}
