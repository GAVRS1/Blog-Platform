using BlogContent.Core.Enums;
using BlogContent.Core.Models;
using BlogContent.WebAPI.DTOs;

namespace BlogContent.WPF.Api;

public static class ApiDtoMapper
{
    public static User MapUser(UserResponseDto dto)
    {
        var profileDto = dto.Profile;
        var profile = new Profile
        {
            Username = profileDto?.Username ?? dto.Username,
            FullName = profileDto?.FullName ?? string.Empty,
            BirthDate = profileDto?.BirthDate ?? default,
            Age = profileDto?.Age ?? 0,
            Bio = profileDto?.Bio ?? string.Empty,
            ProfilePictureUrl = profileDto?.ProfilePictureUrl ?? string.Empty
        };

        return new User
        {
            Id = dto.Id,
            Username = dto.Username,
            Email = dto.Email,
            EmailConfirmed = dto.EmailConfirmed,
            Status = dto.Status,
            Profile = profile
        };
    }

    public static Post MapPost(PostResponseDto dto, int? currentUserId)
    {
        var user = new User
        {
            Id = dto.UserId,
            Username = dto.Username,
            Profile = new Profile
            {
                FullName = dto.UserFullName ?? dto.Username,
                ProfilePictureUrl = dto.UserAvatar ?? string.Empty
            }
        };

        var attachments = dto.Attachments
            .Select(a => new PostMedia
            {
                Id = a.Id,
                Url = a.Url ?? string.Empty,
                MimeType = a.MimeType ?? string.Empty,
                SizeBytes = a.SizeBytes,
                Type = a.Type
            })
            .ToList();

        var post = new Post
        {
            Id = dto.Id,
            Title = dto.Title,
            Content = dto.Content,
            ContentType = dto.ContentType,
            CreatedAt = dto.CreatedAt,
            UserId = dto.UserId,
            User = user,
            Media = attachments,
            Likes = BuildPostLikes(dto.LikeCount, dto.IsLikedByCurrentUser, currentUserId),
            Comments = BuildCommentPlaceholders(dto.CommentCount)
        };

        post.ImageUrl = attachments.FirstOrDefault(a => a.Type == PostMediaType.Image)?.Url;
        post.VideoUrl = attachments.FirstOrDefault(a => a.Type == PostMediaType.Video)?.Url;
        post.AudioUrl = attachments.FirstOrDefault(a => a.Type == PostMediaType.Audio)?.Url;

        return post;
    }

    public static Comment MapComment(CommentResponseDto dto, int? currentUserId)
    {
        var user = new User
        {
            Id = dto.UserId,
            Username = dto.Username,
            Profile = new Profile
            {
                FullName = string.IsNullOrWhiteSpace(dto.UserFullName) ? dto.Username : dto.UserFullName,
                ProfilePictureUrl = dto.UserAvatar ?? string.Empty
            }
        };

        return new Comment
        {
            Id = dto.Id,
            Content = dto.Content,
            CreatedAt = dto.CreatedAt,
            PostId = dto.PostId,
            UserId = dto.UserId,
            User = user,
            Likes = BuildCommentLikes(dto.LikeCount, dto.IsLikedByCurrentUser, currentUserId),
            Replies = BuildReplyPlaceholders(dto.ReplyCount)
        };
    }

    public static CommentReply MapReply(CommentReplyResponseDto dto)
    {
        var user = new User
        {
            Id = dto.UserId,
            Username = dto.Username,
            Profile = new Profile
            {
                FullName = string.IsNullOrWhiteSpace(dto.UserFullName) ? dto.Username : dto.UserFullName,
                ProfilePictureUrl = dto.UserAvatar ?? string.Empty
            }
        };

        return new CommentReply
        {
            Id = dto.Id,
            CommentId = dto.CommentId,
            Content = dto.Content,
            CreatedAt = dto.CreatedAt,
            UserId = dto.UserId,
            User = user
        };
    }

    public static PostDto MapPostRequest(Post post)
    {
        var attachments = new List<PostMediaDto>();

        if (!string.IsNullOrWhiteSpace(post.ImageUrl))
        {
            attachments.Add(new PostMediaDto { Url = post.ImageUrl, Type = PostMediaType.Image });
        }

        if (!string.IsNullOrWhiteSpace(post.VideoUrl))
        {
            attachments.Add(new PostMediaDto { Url = post.VideoUrl, Type = PostMediaType.Video });
        }

        if (!string.IsNullOrWhiteSpace(post.AudioUrl))
        {
            attachments.Add(new PostMediaDto { Url = post.AudioUrl, Type = PostMediaType.Audio });
        }

        if (post.Media != null)
        {
            foreach (var media in post.Media.Where(m => !string.IsNullOrWhiteSpace(m.Url)))
            {
                attachments.Add(new PostMediaDto
                {
                    Id = media.Id,
                    Url = media.Url,
                    MimeType = media.MimeType,
                    SizeBytes = media.SizeBytes,
                    Type = media.Type
                });
            }
        }

        return new PostDto
        {
            Title = post.Title,
            Content = post.Content,
            Attachments = attachments
        };
    }

    private static List<Like> BuildPostLikes(int count, bool isLikedByCurrentUser, int? currentUserId)
    {
        var likes = new List<Like>();

        if (count <= 0)
        {
            return likes;
        }

        if (isLikedByCurrentUser && currentUserId.HasValue)
        {
            likes.Add(new Like { UserId = currentUserId.Value });
        }

        while (likes.Count < count)
        {
            likes.Add(new Like { UserId = 0 });
        }

        return likes;
    }

    private static List<CommentLike> BuildCommentLikes(int count, bool isLikedByCurrentUser, int? currentUserId)
    {
        var likes = new List<CommentLike>();

        if (count <= 0)
        {
            return likes;
        }

        if (isLikedByCurrentUser && currentUserId.HasValue)
        {
            likes.Add(new CommentLike { UserId = currentUserId.Value });
        }

        while (likes.Count < count)
        {
            likes.Add(new CommentLike { UserId = 0 });
        }

        return likes;
    }

    private static List<Comment> BuildCommentPlaceholders(int count)
    {
        var comments = new List<Comment>();
        for (var i = 0; i < count; i++)
        {
            comments.Add(new Comment());
        }

        return comments;
    }

    private static List<CommentReply> BuildReplyPlaceholders(int count)
    {
        var replies = new List<CommentReply>();
        for (var i = 0; i < count; i++)
        {
            replies.Add(new CommentReply());
        }

        return replies;
    }
}
