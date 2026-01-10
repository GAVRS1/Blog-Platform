using System;
using System.Linq;
using BlogContent.Core.Models;

namespace BlogContent.WebAPI.DTOs;

public record CommentResponseDto
{
    public int Id { get; init; }
    public string Content { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public int PostId { get; init; }
    public int UserId { get; init; }
    public string Username { get; init; } = string.Empty;
    public string UserFullName { get; init; } = string.Empty;
    public string UserAvatar { get; init; } = string.Empty;
    public int LikeCount { get; init; }
    public int ReplyCount { get; init; }
    public bool IsLikedByCurrentUser { get; init; }
}

public record CommentReplyResponseDto
{
    public int Id { get; init; }
    public int CommentId { get; init; }
    public string Content { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public int UserId { get; init; }
    public string Username { get; init; } = string.Empty;
    public string UserFullName { get; init; } = string.Empty;
    public string UserAvatar { get; init; } = string.Empty;
}

public static class CommentMappingExtensions
{
    public static CommentResponseDto ToResponseDto(this Comment comment, int currentUserId)
    {
        return new CommentResponseDto
        {
            Id = comment.Id,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt,
            PostId = comment.PostId,
            UserId = comment.UserId,
            Username = comment.User?.Username ?? string.Empty,
            UserFullName = comment.User?.Profile?.FullName ?? comment.User?.Username ?? string.Empty,
            UserAvatar = comment.User?.Profile?.ProfilePictureUrl ?? string.Empty,
            LikeCount = comment.Likes?.Count ?? 0,
            ReplyCount = comment.Replies?.Count ?? 0,
            IsLikedByCurrentUser = comment.Likes?.Any(l => l.UserId == currentUserId) ?? false
        };
    }

    public static CommentReplyResponseDto ToResponseDto(this CommentReply reply)
    {
        return new CommentReplyResponseDto
        {
            Id = reply.Id,
            CommentId = reply.CommentId,
            Content = reply.Content,
            CreatedAt = reply.CreatedAt,
            UserId = reply.UserId,
            Username = reply.User?.Username ?? string.Empty,
            UserFullName = reply.User?.Profile?.FullName ?? reply.User?.Username ?? string.Empty,
            UserAvatar = reply.User?.Profile?.ProfilePictureUrl ?? string.Empty
        };
    }
}
