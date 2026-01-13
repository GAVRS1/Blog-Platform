using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using BlogContent.WebAPI.DTOs;
using System.Net.Http;

namespace BlogContent.WPF.Api;

public class CommentsApiClient : ApiClientBase, ICommentService
{
    public CommentsApiClient(HttpClient httpClient, ApiClientOptions options, ApiTokenStore tokenStore)
        : base(httpClient, options, tokenStore)
    {
    }

    public Comment GetCommentById(int id)
    {
        var dto = GetAsync<CommentResponseDto>($"comments/{id}").GetAwaiter().GetResult();
        if (dto == null)
        {
            throw new InvalidOperationException("Комментарий не найден.");
        }

        return ApiDtoMapper.MapComment(dto, TokenStore.CurrentUserId);
    }

    public Comment GetCommentByIdWithDetails(int id) => GetCommentById(id);

    public PagedResult<Comment> GetCommentsByPostId(int postId, int page, int pageSize)
    {
        var response = GetAsync<PagedResponse<CommentResponseDto>>($"comments/post/{postId}?page={page}&pageSize={pageSize}")
            .GetAwaiter()
            .GetResult();

        if (response == null)
        {
            return new PagedResult<Comment>(Enumerable.Empty<Comment>(), 0, page, pageSize);
        }

        var items = response.Items.Select(dto => ApiDtoMapper.MapComment(dto, TokenStore.CurrentUserId));
        return new PagedResult<Comment>(items, response.Total, response.Page, response.PageSize);
    }

    public IEnumerable<Comment> GetCommentsByPostIdWithDetails(int postId)
    {
        return GetCommentsByPostId(postId, 1, 100).Items;
    }

    public IEnumerable<Comment> GetCommentsByPostIdWithUsers(int postId)
    {
        return GetCommentsByPostId(postId, 1, 100).Items;
    }

    public IEnumerable<Comment> GetCommentsByUserId(int userId)
    {
        throw new NotSupportedException("Поиск комментариев пользователя не поддерживается WebAPI.");
    }

    public void CreateComment(Comment comment)
    {
        var payload = new CommentDto
        {
            Content = comment.Content,
            PostId = comment.PostId
        };
        PostAsync<CommentResponseDto>("comments", payload).GetAwaiter().GetResult();
    }

    public void UpdateComment(Comment comment)
    {
        throw new NotSupportedException("Обновление комментария не поддерживается WebAPI.");
    }

    public void DeleteComment(int id)
    {
        DeleteAsync($"comments/{id}").GetAwaiter().GetResult();
    }

    public IEnumerable<CommentLike> GetLikesByCommentId(int commentId)
    {
        var comment = GetCommentById(commentId);
        return comment.Likes ?? new List<CommentLike>();
    }

    public PagedResult<CommentReply> GetRepliesByCommentId(int commentId, int page, int pageSize)
    {
        var response = GetAsync<PagedResponse<CommentReplyResponseDto>>($"comments/{commentId}/replies?page={page}&pageSize={pageSize}")
            .GetAwaiter()
            .GetResult();

        if (response == null)
        {
            return new PagedResult<CommentReply>(Enumerable.Empty<CommentReply>(), 0, page, pageSize);
        }

        var items = response.Items.Select(ApiDtoMapper.MapReply);
        return new PagedResult<CommentReply>(items, response.Total, response.Page, response.PageSize);
    }

    public IEnumerable<CommentReply> GetCommentReplies(int commentId)
    {
        return GetRepliesByCommentId(commentId, 1, 100).Items;
    }

    public CommentReply GetReplyById(int replyId)
    {
        throw new NotSupportedException("Получение ответа по ID не поддерживается WebAPI.");
    }

    public CommentLike GetCommentLike(int commentId, int userId)
    {
        var comment = GetCommentById(commentId);
        var like = comment.Likes.FirstOrDefault(l => l.UserId == userId);
        if (like == null)
        {
            throw new InvalidOperationException("Лайк не найден.");
        }

        return like;
    }

    public void AddCommentLike(CommentLike like)
    {
        PostAsync("likes/comment/" + like.CommentId, payload: null).GetAwaiter().GetResult();
    }

    public void RemoveCommentLike(int likeId)
    {
        throw new NotSupportedException("Удаление лайка по ID не поддерживается WebAPI.");
    }

    public void AddReply(int commentId, string content, int userId)
    {
        var payload = new ReplyDto { Content = content };
        PostAsync<CommentReplyResponseDto>($"comments/{commentId}/reply", payload).GetAwaiter().GetResult();
    }

    public CommentLike CreateCommentLike(CommentLike like)
    {
        AddCommentLike(like);
        return like;
    }

    public CommentReply AddReplyWithReturn(CommentReply reply)
    {
        var payload = new ReplyDto { Content = reply.Content };
        var response = PostAsync<CommentReplyResponseDto>($"comments/{reply.CommentId}/reply", payload).GetAwaiter().GetResult();
        if (response == null)
        {
            return reply;
        }

        return ApiDtoMapper.MapReply(response);
    }

    public void DeleteReply(int replyId)
    {
        DeleteAsync($"comments/reply/{replyId}").GetAwaiter().GetResult();
    }

    public void LikeComment(int commentId, int userId)
    {
        PostAsync("likes/comment/" + commentId, payload: null).GetAwaiter().GetResult();
    }

    public void UnlikeComment(int commentId, int userId)
    {
        PostAsync("likes/comment/" + commentId, payload: null).GetAwaiter().GetResult();
    }
}
