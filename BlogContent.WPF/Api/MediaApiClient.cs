using System.Net.Http;
using System.Net.Http.Headers;
using BlogContent.WPF.Models;
using BlogContent.WPF.Services;
using BlogContent.WebAPI.DTOs;

namespace BlogContent.WPF.Api;

public class MediaApiClient : ApiClientBase
{
    private readonly MediaUrlResolver _urlResolver;

    public MediaApiClient(
        HttpClient httpClient,
        ApiClientOptions options,
        ApiTokenStore tokenStore,
        MediaUrlResolver urlResolver)
        : base(httpClient, options, tokenStore)
    {
        _urlResolver = urlResolver ?? throw new ArgumentNullException(nameof(urlResolver));
    }

    public async Task<MediaUploadResult> UploadAsync(string filePath, string? mediaType, bool isPublic, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(filePath) || !File.Exists(filePath))
        {
            throw new InvalidOperationException("Файл для загрузки не найден.");
        }

        using var content = new MultipartFormDataContent();
        await using var fileStream = File.OpenRead(filePath);
        using var fileContent = new StreamContent(fileStream);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");

        content.Add(fileContent, "file", Path.GetFileName(filePath));

        if (!string.IsNullOrWhiteSpace(mediaType))
        {
            content.Add(new StringContent(mediaType), "type");
        }

        var path = isPublic ? "media/upload/public" : "media/upload";
        using var request = CreateRequest(HttpMethod.Post, path, requireAuth: !isPublic);
        request.Content = content;

        using var response = await HttpClient.SendAsync(request, cancellationToken);
        var dto = await ReadResponseAsync<MediaUploadResponse>(response);
        if (dto == null)
        {
            throw new InvalidOperationException("Сервер не вернул данные о загруженном файле.");
        }

        return new MediaUploadResult(
            Url: ResolveUrl(dto.Url),
            ThumbnailUrl: dto.ThumbnailUrl is null ? null : ResolveUrl(dto.ThumbnailUrl),
            MimeType: dto.MimeType,
            SizeBytes: dto.SizeBytes,
            Type: dto.Type);
    }

    public string? GetMediaUrl(string? mediaPath) => _urlResolver.ToAbsoluteUrl(mediaPath);

    private MediaUrlReference ResolveUrl(string? url)
    {
        var relative = _urlResolver.ToRelativeUrl(url) ?? string.Empty;
        var absolute = _urlResolver.ToAbsoluteUrl(url) ?? relative;
        return new MediaUrlReference(relative, absolute);
    }
}
