using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using BlogContent.WebAPI.DTOs;
using System.Net.Http;

namespace BlogContent.WPF.Api;

public class LikesApiClient : ApiClientBase, ILikeService
{
    public LikesApiClient(HttpClient httpClient, ApiClientOptions options, ApiTokenStore tokenStore)
        : base(httpClient, options, tokenStore)
    {
    }

    public Like GetLikeById(int id)
    {
        throw new NotSupportedException("Получение лайка по ID не поддерживается WebAPI.");
    }

    public IEnumerable<Like> GetLikesByUserId(int userId)
    {
        var posts = GetAsync<PagedResponse<PostResponseDto>>("posts?page=1&pageSize=100")
            .GetAwaiter()
            .GetResult();

        if (posts == null)
        {
            return Enumerable.Empty<Like>();
        }

        var likedPosts = posts.Items.Where(p => p.IsLikedByCurrentUser).ToList();
        var likes = new List<Like>();

        foreach (var post in likedPosts)
        {
            likes.Add(new Like { PostId = post.Id, UserId = userId });
        }

        return likes;
    }

    public IEnumerable<Like> GetLikesByPostId(int postId)
    {
        var likes = GetAsync<List<Like>>($"likes/post/{postId}").GetAwaiter().GetResult();
        return likes ?? new List<Like>();
    }

    public Like GetLikeByPostAndUser(int postId, int userId)
    {
        var likes = GetLikesByPostId(postId);
        var like = likes.FirstOrDefault(l => l.UserId == userId);
        if (like == null)
        {
            throw new InvalidOperationException("Лайк не найден.");
        }

        return like;
    }

    public void CreateLike(Like like)
    {
        PostAsync("likes/post/" + like.PostId, payload: null).GetAwaiter().GetResult();
    }

    public void DeleteLike(int id)
    {
        throw new NotSupportedException("Удаление лайка по ID не поддерживается WebAPI.");
    }
}
