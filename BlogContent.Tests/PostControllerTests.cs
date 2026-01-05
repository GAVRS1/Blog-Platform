using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;
using BlogContent.Core.Enums;
using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using BlogContent.WebAPI.Controllers;
using BlogContent.WebAPI.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace BlogContent.Tests;

public class PostControllerTests
{
    [Fact]
    public void Create_ShouldReturnCreated_WhenContentTypeOmitted()
    {
        var service = new FakePostService();
        var controller = BuildController(service);

        var dto = new PostDto
        {
            Title = "Hello world",
            Content = "Some content",
            Attachments = []
        };

        var result = controller.Create(dto) as CreatedAtActionResult;

        Assert.NotNull(result);
        Assert.Equal(201, result!.StatusCode ?? 201);

        var response = Assert.IsType<PostResponseDto>(result.Value);
        Assert.Equal(ContentType.Article, response.ContentType);
        Assert.Equal(ContentType.Article, service.LastCreatedPost?.ContentType);
    }

    [Fact]
    public void Create_ShouldReturnCreated_WhenContentTypeIsUnknownString()
    {
        var json = """
        {
            "title": "Photo post",
            "content": "",
            "attachments": [
                { "type": "Image", "url": "https://cdn.example.com/image.png", "mimeType": "image/png", "sizeBytes": 12 }
            ],
            "contentType": "NotAnEnum"
        }
        """;

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
        options.Converters.Add(new JsonStringEnumConverter());

        var dto = JsonSerializer.Deserialize<PostDto>(json, options)!;

        var service = new FakePostService();
        var controller = BuildController(service);

        var result = controller.Create(dto) as CreatedAtActionResult;

        Assert.NotNull(result);
        Assert.Equal(201, result!.StatusCode ?? 201);

        var response = Assert.IsType<PostResponseDto>(result.Value);
        Assert.Equal(ContentType.Photo, response.ContentType);
        Assert.Equal(ContentType.Photo, service.LastCreatedPost?.ContentType);
    }

    private static PostsController BuildController(FakePostService service)
    {
        var controller = new PostsController(service);
        var httpContext = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(
                new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, "42") }))
        };

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = httpContext
        };

        return controller;
    }

    private class FakePostService : IPostService
    {
        private int _nextId = 1;

        public Post? LastCreatedPost { get; private set; }

        public void CreatePost(Post post)
        {
            post.Id = _nextId++;
            LastCreatedPost = post;
        }

        public Post GetPostById(int id) => throw new NotImplementedException();
        public IEnumerable<Post> GetAllPostsWithUsers() => throw new NotImplementedException();
        public IEnumerable<Post> GetPostsById(IEnumerable<int> postIds) => throw new NotImplementedException();
        public PagedResult<Post> GetPostsByUser(int userId, int page, int pageSize) => throw new NotImplementedException();
        public PagedResult<Post> GetAllPosts(int page, int pageSize) => throw new NotImplementedException();
        public void UpdatePost(Post post) => throw new NotImplementedException();
        public void DeletePost(int id) => throw new NotImplementedException();
        public void AddLike(int postId, int userId) => throw new NotImplementedException();
        public void RemoveLike(int postId, int userId) => throw new NotImplementedException();
        public void AddComment(Comment comment) => throw new NotImplementedException();
    }
}
