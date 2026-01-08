using Microsoft.EntityFrameworkCore;
using BlogContent.Core.Enums;
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
    public DbSet<PrivacySettings> PrivacySettings { get; set; }
    public DbSet<NotificationSettings> NotificationSettings { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Report> Reports { get; set; }
    public DbSet<ModerationAction> ModerationActions { get; set; }
    public DbSet<Appeal> Appeals { get; set; }
    public DbSet<Block> Blocks { get; set; }

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
            .HasOne(u => u.PrivacySettings)
            .WithOne(ps => ps.User)
            .HasForeignKey<PrivacySettings>(ps => ps.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<User>()
            .HasOne(u => u.NotificationSettings)
            .WithOne(ns => ns.User)
            .HasForeignKey<NotificationSettings>(ns => ns.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.RecipientUser)
            .WithMany(u => u.ReceivedNotifications)
            .HasForeignKey(n => n.RecipientUserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.Sender)
            .WithMany(u => u.SentNotifications)
            .HasForeignKey(n => n.SenderId)
            .OnDelete(DeleteBehavior.SetNull);

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

        modelBuilder.Entity<Notification>()
            .Property(n => n.CreatedAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        modelBuilder.Entity<Notification>()
            .Property(n => n.IsRead)
            .HasDefaultValue(false);

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

        modelBuilder.Entity<PrivacySettings>()
            .Property(ps => ps.CanMessageFrom)
            .HasDefaultValue(Audience.Everyone);

        modelBuilder.Entity<PrivacySettings>()
            .Property(ps => ps.CanCommentFrom)
            .HasDefaultValue(Audience.Everyone);

        modelBuilder.Entity<PrivacySettings>()
            .Property(ps => ps.ProfileVisibility)
            .HasDefaultValue(Audience.Everyone);

        modelBuilder.Entity<PrivacySettings>()
            .Property(ps => ps.ShowActivity)
            .HasDefaultValue(true);

        modelBuilder.Entity<PrivacySettings>()
            .Property(ps => ps.ShowEmail)
            .HasDefaultValue(false);

        modelBuilder.Entity<NotificationSettings>()
            .Property(ns => ns.OnLikes)
            .HasDefaultValue(true);

        modelBuilder.Entity<NotificationSettings>()
            .Property(ns => ns.OnComments)
            .HasDefaultValue(true);

        modelBuilder.Entity<NotificationSettings>()
            .Property(ns => ns.OnFollows)
            .HasDefaultValue(true);

        modelBuilder.Entity<NotificationSettings>()
            .Property(ns => ns.OnMessages)
            .HasDefaultValue(true);

        modelBuilder.Entity<Report>()
            .Property(r => r.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        modelBuilder.Entity<Report>()
            .Property(r => r.CreatedAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        modelBuilder.Entity<ModerationAction>()
            .Property(ma => ma.ActionType)
            .HasConversion<string>()
            .HasMaxLength(30);

        modelBuilder.Entity<ModerationAction>()
            .Property(ma => ma.CreatedAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        modelBuilder.Entity<Appeal>()
            .Property(a => a.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        modelBuilder.Entity<Appeal>()
            .Property(a => a.CreatedAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        modelBuilder.Entity<Block>()
            .Property(b => b.CreatedAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

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

        modelBuilder.Entity<Report>()
            .HasIndex(r => r.ReporterUserId);

        modelBuilder.Entity<Report>()
            .HasIndex(r => r.TargetUserId);

        modelBuilder.Entity<ModerationAction>()
            .HasIndex(a => a.AdminUserId);

        modelBuilder.Entity<ModerationAction>()
            .HasIndex(a => a.TargetUserId);

        modelBuilder.Entity<Appeal>()
            .HasIndex(a => a.UserId);

        modelBuilder.Entity<Block>()
            .HasIndex(b => new { b.BlockerUserId, b.BlockedUserId });

        modelBuilder.Entity<Block>()
            .HasIndex(b => new { b.BlockerUserId, b.IsActive });

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

        modelBuilder.Entity<Notification>()
            .HasIndex(n => n.RecipientUserId);

        modelBuilder.Entity<Notification>()
            .HasIndex(n => new { n.RecipientUserId, n.IsRead });

        modelBuilder.Entity<Notification>()
            .HasIndex(n => new { n.RecipientUserId, n.SenderId, n.Type, n.SubjectType, n.SubjectId });

        modelBuilder.Entity<PrivacySettings>()
            .HasIndex(ps => ps.UserId)
            .IsUnique();

        modelBuilder.Entity<NotificationSettings>()
            .HasIndex(ns => ns.UserId)
            .IsUnique();

        modelBuilder.Entity<Report>()
            .HasOne(r => r.ReporterUser)
            .WithMany(u => u.ReportsSent)
            .HasForeignKey(r => r.ReporterUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Report>()
            .HasOne(r => r.TargetUser)
            .WithMany(u => u.ReportsReceived)
            .HasForeignKey(r => r.TargetUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ModerationAction>()
            .HasOne(a => a.AdminUser)
            .WithMany(u => u.ModerationActionsTaken)
            .HasForeignKey(a => a.AdminUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ModerationAction>()
            .HasOne(a => a.TargetUser)
            .WithMany(u => u.ModerationActionsAgainst)
            .HasForeignKey(a => a.TargetUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Appeal>()
            .HasOne(a => a.User)
            .WithMany(u => u.Appeals)
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Block>()
            .HasOne(b => b.BlockerUser)
            .WithMany(u => u.BlocksInitiated)
            .HasForeignKey(b => b.BlockerUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Block>()
            .HasOne(b => b.BlockedUser)
            .WithMany(u => u.BlocksReceived)
            .HasForeignKey(b => b.BlockedUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
