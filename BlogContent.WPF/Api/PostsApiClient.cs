using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using BlogContent.WebAPI.DTOs;
using System.Net.Http;

namespace BlogContent.WPF.Api;

public class PostsApiClient : ApiClientBase, IPostService
{
    public PostsApiClient(HttpClient httpClient, ApiClientOptions options, ApiTokenStore tokenStore)
        : base(httpClient, options, tokenStore)
    {
    }

    public Post GetPostById(int id)
    {
        var dto = GetAsync<PostResponseDto>($"posts/{id}").GetAwaiter().GetResult();
        if (dto == null)
        {
            throw new InvalidOperationException("Пост не найден.");
        }

        return ApiDtoMapper.MapPost(dto, TokenStore.CurrentUserId);
    }

    public IEnumerable<Post> GetAllPostsWithUsers()
    {
        return GetAllPostsPaged(1, 100);
    }

    public IEnumerable<Post> GetPostsById(IEnumerable<int> postIds)
    {
        var tasks = postIds.Select(async id => await GetAsync<PostResponseDto>($"posts/{id}"));
        var results = Task.WhenAll(tasks).GetAwaiter().GetResult();
        return results.Where(dto => dto != null).Select(dto => ApiDtoMapper.MapPost(dto!, TokenStore.CurrentUserId));
    }

    public PagedResult<Post> GetPostsByUser(int userId, int page, int pageSize)
    {
        var response = GetAsync<PagedResponse<PostResponseDto>>($"posts/user/{userId}?page={page}&pageSize={pageSize}")
            .GetAwaiter()
            .GetResult();

        if (response == null)
        {
            return new PagedResult<Post>(Enumerable.Empty<Post>(), 0, page, pageSize);
        }

        var items = response.Items.Select(dto => ApiDtoMapper.MapPost(dto, TokenStore.CurrentUserId));
        return new PagedResult<Post>(items, response.Total, response.Page, response.PageSize);
    }

    public PagedResult<Post> GetAllPosts(int page, int pageSize)
    {
        var response = GetAsync<PagedResponse<PostResponseDto>>($"posts?page={page}&pageSize={pageSize}")
            .GetAwaiter()
            .GetResult();

        if (response == null)
        {
            return new PagedResult<Post>(Enumerable.Empty<Post>(), 0, page, pageSize);
        }

        var items = response.Items.Select(dto => ApiDtoMapper.MapPost(dto, TokenStore.CurrentUserId));
        return new PagedResult<Post>(items, response.Total, response.Page, response.PageSize);
    }

    public void CreatePost(Post post)
    {
        var payload = ApiDtoMapper.MapPostRequest(post);
        PostAsync<PostResponseDto>("posts", payload).GetAwaiter().GetResult();
    }

    public void UpdatePost(Post post)
    {
        throw new NotSupportedException("Обновление поста не поддерживается WebAPI.");
    }

    public void DeletePost(int id)
    {
        DeleteAsync($"posts/{id}").GetAwaiter().GetResult();
    }

    public void AddLike(int postId, int userId)
    {
        PostAsync("likes/post/" + postId, payload: null).GetAwaiter().GetResult();
    }

    public void RemoveLike(int postId, int userId)
    {
        PostAsync("likes/post/" + postId, payload: null).GetAwaiter().GetResult();
    }

    public void AddComment(Comment comment)
    {
        var payload = new CommentDto
        {
            Content = comment.Content,
            PostId = comment.PostId
        };
        PostAsync<CommentResponseDto>("comments", payload).GetAwaiter().GetResult();
    }

    private IEnumerable<Post> GetAllPostsPaged(int startPage, int pageSize)
    {
        var allPosts = new List<Post>();
        var page = startPage;

        while (true)
        {
            var response = GetAsync<PagedResponse<PostResponseDto>>($"posts?page={page}&pageSize={pageSize}")
                .GetAwaiter()
                .GetResult();

            if (response == null)
            {
                break;
            }

            var items = response.Items.Select(dto => ApiDtoMapper.MapPost(dto, TokenStore.CurrentUserId)).ToList();
            allPosts.AddRange(items);

            if (allPosts.Count >= response.Total || items.Count == 0)
            {
                break;
            }

            page++;
        }

        return allPosts;
    }
}
