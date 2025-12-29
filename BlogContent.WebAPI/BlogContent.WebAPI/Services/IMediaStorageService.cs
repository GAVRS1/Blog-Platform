using BlogContent.WebAPI.DTOs;
using Microsoft.AspNetCore.Http;

namespace BlogContent.WebAPI.Services;

public interface IMediaStorageService
{
    Task<MediaUploadResponse> SaveAsync(IFormFile file, string mediaType, CancellationToken cancellationToken = default);
}
