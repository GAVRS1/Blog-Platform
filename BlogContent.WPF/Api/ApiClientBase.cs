using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace BlogContent.WPF.Api;

public abstract class ApiClientBase
{
    private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    protected ApiClientBase(HttpClient httpClient, ApiClientOptions options, ApiTokenStore tokenStore)
    {
        HttpClient = httpClient;
        Options = options;
        TokenStore = tokenStore;
    }

    protected HttpClient HttpClient { get; }
    protected ApiClientOptions Options { get; }
    protected ApiTokenStore TokenStore { get; }

    protected async Task<T?> GetAsync<T>(string path, bool requireAuth = true)
    {
        using var request = CreateRequest(HttpMethod.Get, path, requireAuth);
        using var response = await HttpClient.SendAsync(request);
        return await ReadResponseAsync<T>(response);
    }

    protected async Task<T?> PostAsync<T>(string path, object? payload, bool requireAuth = true)
    {
        using var request = CreateRequest(HttpMethod.Post, path, requireAuth);
        if (payload != null)
        {
            request.Content = JsonContent.Create(payload, options: _jsonOptions);
        }

        using var response = await HttpClient.SendAsync(request);
        return await ReadResponseAsync<T>(response);
    }

    protected async Task PostAsync(string path, object? payload, bool requireAuth = true)
    {
        using var request = CreateRequest(HttpMethod.Post, path, requireAuth);
        if (payload != null)
        {
            request.Content = JsonContent.Create(payload, options: _jsonOptions);
        }

        using var response = await HttpClient.SendAsync(request);
        await EnsureSuccessAsync(response);
    }

    protected async Task PutAsync(string path, object? payload, bool requireAuth = true)
    {
        using var request = CreateRequest(HttpMethod.Put, path, requireAuth);
        if (payload != null)
        {
            request.Content = JsonContent.Create(payload, options: _jsonOptions);
        }

        using var response = await HttpClient.SendAsync(request);
        await EnsureSuccessAsync(response);
    }

    protected async Task DeleteAsync(string path, bool requireAuth = true)
    {
        using var request = CreateRequest(HttpMethod.Delete, path, requireAuth);
        using var response = await HttpClient.SendAsync(request);
        await EnsureSuccessAsync(response);
    }

    protected HttpRequestMessage CreateRequest(HttpMethod method, string path, bool requireAuth)
    {
        var request = new HttpRequestMessage(method, Options.BuildApiPath(path));
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        if (requireAuth && !string.IsNullOrWhiteSpace(TokenStore.AccessToken))
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", TokenStore.AccessToken);
        }

        return request;
    }

    protected async Task<T?> ReadResponseAsync<T>(HttpResponseMessage response)
    {
        if (!response.IsSuccessStatusCode)
        {
            await EnsureSuccessAsync(response);
        }

        if (response.Content == null)
        {
            return default;
        }

        return await response.Content.ReadFromJsonAsync<T>(_jsonOptions);
    }

    protected static async Task EnsureSuccessAsync(HttpResponseMessage response)
    {
        if (response.IsSuccessStatusCode)
        {
            return;
        }

        var content = response.Content == null ? string.Empty : await response.Content.ReadAsStringAsync();
        var message = string.IsNullOrWhiteSpace(content)
            ? $"API request failed with status {(int)response.StatusCode}."
            : content;

        throw new InvalidOperationException(message);
    }
}
