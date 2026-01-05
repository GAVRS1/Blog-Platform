using System.Linq;
using System.Text;
using BlogContent.WebAPI.Controllers;
using BlogContent.WebAPI.DTOs;
using BlogContent.WebAPI.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace BlogContent.Tests;

public class MediaControllerTests
{
    [Fact]
    public async Task Upload_ShouldReturnAbsoluteUrl_WhenTypeMissing()
    {
        var controller = BuildController();
        var file = BuildFile("avatar.png", "image/png", 1024);
        var request = new MediaUploadRequest { File = file, Type = null };

        var result = await controller.Upload(request, CancellationToken.None) as OkObjectResult;

        Assert.NotNull(result);
        var payload = Assert.IsType<MediaUploadResponse>(result!.Value);
        Assert.Equal("https://api.test/uploads/avatar.png", payload.Url);
        Assert.Equal("image/png", payload.MimeType);
        Assert.Equal("image", payload.Type);
    }

    [Fact]
    public async Task UploadBatch_ShouldRejectMoreThanTenFiles()
    {
        var controller = BuildController();
        var files = Enumerable.Range(0, 11)
            .Select(i => BuildFile($"f{i}.bin", "application/octet-stream", 10))
            .ToList();
        var request = new MediaUploadBatchRequest { Files = files };

        var result = await controller.UploadBatch(request, CancellationToken.None);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Максимум 10 файлов за раз.", badRequest.Value);
    }

    private static MediaController BuildController()
    {
        var storage = new FakeMediaStorageService();
        var controller = new MediaController(storage, NullLogger<MediaController>.Instance);
        var httpContext = new DefaultHttpContext
        {
            Request =
            {
                Scheme = "https",
                Host = new HostString("api.test")
            }
        };

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = httpContext
        };

        return controller;
    }

    private static IFormFile BuildFile(string name, string contentType, int size)
    {
        var bytes = Encoding.UTF8.GetBytes(new string('x', size));
        var stream = new MemoryStream(bytes);
        return new FormFile(stream, 0, bytes.Length, "file", name)
        {
            Headers = new HeaderDictionary(),
            ContentType = contentType
        };
    }

    private class FakeMediaStorageService : IMediaStorageService
    {
        public Task<MediaUploadResponse> SaveAsync(IFormFile file, string? mediaType, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(new MediaUploadResponse
            {
                Url = $"/uploads/{file.FileName}",
                ThumbnailUrl = null,
                MimeType = file.ContentType,
                SizeBytes = file.Length,
                Type = mediaType ?? "image"
            });
        }
    }
}
