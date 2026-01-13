using BlogContent.Core.Enums;
using BlogContent.Core.Models;
using BlogContent.Core.Interfaces;
using BlogContent.WPF.Api;
using BlogContent.WPF.Utilities;
using BlogContent.WPF.ViewModel.Base;
using Microsoft.Win32;
using System.IO;
using System.Windows.Input;
using System.Windows.Media.Imaging;

namespace BlogContent.WPF.ViewModel;

public class CreatePostViewModel : ViewModelBase
{
    private readonly IPostService _postService;
    private readonly User _currentUser;
    private readonly MediaApiClient _mediaApiClient;

    private string _title;
    private string _content;
    private ContentType _selectedContentType;
    private string _mediaUrl;
    private string _errorMessage;
    private bool _hasError;
    private bool _isLoading;
    private BitmapImage _mediaPreview;
    private string _mediaInfo;
    private bool _hasMedia;

    public string Title
    {
        get => _title;
        set => SetProperty(ref _title, value);
    }

    public string Content
    {
        get => _content;
        set => SetProperty(ref _content, value);
    }

    public ContentType SelectedContentType
    {
        get => _selectedContentType;
        set
        {
            if (SetProperty(ref _selectedContentType, value))
            {
                OnPropertyChanged(nameof(IsArticle));
                OnPropertyChanged(nameof(IsPhoto));
                OnPropertyChanged(nameof(IsVideo));
                OnPropertyChanged(nameof(IsMusic));
                OnPropertyChanged(nameof(IsMediaSectionVisible));
                OnPropertyChanged(nameof(MediaSectionTitle));

                // Очищаем медиа при смене типа
                if (value != ContentType.Article)
                {
                    RemoveMedia();
                }
            }
        }
    }

    public string MediaUrl
    {
        get => _mediaUrl;
        set
        {
            if (SetProperty(ref _mediaUrl, value))
            {
                UpdateMediaPreview();
            }
        }
    }

    public BitmapImage MediaPreview
    {
        get => _mediaPreview;
        set => SetProperty(ref _mediaPreview, value);
    }

    public string MediaInfo
    {
        get => _mediaInfo;
        set => SetProperty(ref _mediaInfo, value);
    }

    public bool HasMedia
    {
        get => _hasMedia;
        set => SetProperty(ref _hasMedia, value);
    }

    public string ErrorMessage
    {
        get => _errorMessage;
        set
        {
            SetProperty(ref _errorMessage, value);
            HasError = !string.IsNullOrEmpty(value);
        }
    }

    public bool HasError
    {
        get => _hasError;
        set => SetProperty(ref _hasError, value);
    }

    public bool IsLoading
    {
        get => _isLoading;
        set => SetProperty(ref _isLoading, value);
    }

    // Свойства для управления интерфейсом
    public bool IsMediaSectionVisible => !IsArticle;
    public string MediaSectionTitle => SelectedContentType switch
    {
        ContentType.Photo => "Добавить изображение",
        ContentType.Video => "Добавить видео",
        ContentType.Music => "Добавить аудио",
        _ => "Добавить медиа"
    };

    // Свойства для RadioButton
    public bool IsArticle
    {
        get => SelectedContentType == ContentType.Article;
        set { if (value) SelectedContentType = ContentType.Article; }
    }

    public bool IsPhoto
    {
        get => SelectedContentType == ContentType.Photo;
        set { if (value) SelectedContentType = ContentType.Photo; }
    }

    public bool IsVideo
    {
        get => SelectedContentType == ContentType.Video;
        set { if (value) SelectedContentType = ContentType.Video; }
    }

    public bool IsMusic
    {
        get => SelectedContentType == ContentType.Music;
        set { if (value) SelectedContentType = ContentType.Music; }
    }

    // Команды
    public ICommand CreatePostCommand { get; }
    public ICommand BrowseMediaCommand { get; }
    public ICommand RemoveMediaCommand { get; }
    public ICommand CancelCommand { get; }

    // Делегат для закрытия окна
    public Action<bool> CloseAction { get; set; }

    public CreatePostViewModel(IPostService postService, MediaApiClient mediaApiClient, User currentUser)
    {
        _postService = postService ?? throw new ArgumentNullException(nameof(postService));
        _mediaApiClient = mediaApiClient ?? throw new ArgumentNullException(nameof(mediaApiClient));
        _currentUser = currentUser ?? throw new ArgumentNullException(nameof(currentUser));

        // Установка типа контента по умолчанию
        SelectedContentType = ContentType.Article;

        // Инициализация команд
        CreatePostCommand = new RelayCommand(async _ => await CreatePostAsync(), _ => CanCreatePost());
        BrowseMediaCommand = new RelayCommand(_ => BrowseMedia());
        RemoveMediaCommand = new RelayCommand(_ => RemoveMedia());
        CancelCommand = new RelayCommand(_ => Close(false));
    }

    private bool CanCreatePost()
    {
        if (string.IsNullOrWhiteSpace(Title))
            return false;

        if (SelectedContentType == ContentType.Article && string.IsNullOrWhiteSpace(Content))
            return false;

        if (SelectedContentType != ContentType.Article && string.IsNullOrWhiteSpace(MediaUrl))
            return false;

        return true;
    }

    private async Task CreatePostAsync()
    {
        ErrorMessage = string.Empty;
        IsLoading = true;

        try
        {
            Post post = new Post
            {
                Title = Title,
                Content = Content ?? string.Empty,
                ContentType = SelectedContentType,
                CreatedAt = DateTime.UtcNow,
                UserId = _currentUser.Id,
                User = _currentUser
            };

            // Обработка медиа-файлов
            if (SelectedContentType != ContentType.Article && !string.IsNullOrEmpty(MediaUrl))
            {
                string? mediaType = SelectedContentType switch
                {
                    ContentType.Photo => "image",
                    ContentType.Video => "video",
                    ContentType.Music => "audio",
                    _ => null
                };

                var uploadResult = await _mediaApiClient.UploadAsync(MediaUrl, mediaType, isPublic: false);
                string storedUrl = uploadResult.Url.RelativeUrl;

                switch (SelectedContentType)
                {
                    case ContentType.Photo:
                        post.ImageUrl = storedUrl;
                        break;
                    case ContentType.Video:
                        post.VideoUrl = storedUrl;
                        break;
                    case ContentType.Music:
                        post.AudioUrl = storedUrl;
                        break;
                }
            }

            await Task.Run(() => _postService.CreatePost(post));
            Close(true);
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Ошибка при создании публикации: {ex.Message}";
        }
        finally
        {
            IsLoading = false;
        }
    }

    private void BrowseMedia()
    {
        OpenFileDialog openFileDialog = new OpenFileDialog
        {
            Filter = SelectedContentType switch
            {
                ContentType.Photo => "Изображения (*.jpg, *.jpeg, *.png)|*.jpg;*.jpeg;*.png",
                ContentType.Video => "Видео (*.mp4, *.mov)|*.mp4;*.mov",
                ContentType.Music => "Аудио (*.mp3, *.wav)|*.mp3;*.wav",
                _ => "Все файлы (*.*)|*.*"
            },
            Title = MediaSectionTitle
        };

        if (openFileDialog.ShowDialog() == true)
        {
            MediaUrl = openFileDialog.FileName;
        }
    }

    private void RemoveMedia()
    {
        MediaUrl = string.Empty;
        MediaPreview = null;
        MediaInfo = string.Empty;
        HasMedia = false;
    }

    private void UpdateMediaPreview()
    {
        HasMedia = !string.IsNullOrEmpty(MediaUrl) && File.Exists(MediaUrl);

        if (!HasMedia)
        {
            RemoveMedia();
            return;
        }

        try
        {
            if (IsPhoto)
            {
                BitmapImage image = new BitmapImage();
                image.BeginInit();
                image.CacheOption = BitmapCacheOption.OnLoad;
                image.UriSource = new Uri(MediaUrl);
                image.EndInit();
                MediaPreview = image;
                MediaInfo = $"Изображение: {Path.GetFileName(MediaUrl)}";
            }
            else
            {
                MediaPreview = null;
                FileInfo fileInfo = new FileInfo(MediaUrl);
                string fileSize = fileInfo.Length < 1024 * 1024
                    ? $"{fileInfo.Length / 1024} КБ"
                    : $"{fileInfo.Length / (1024 * 1024)} МБ";

                MediaInfo = $"{SelectedContentType}: {Path.GetFileName(MediaUrl)}\nРазмер: {fileSize}";
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Ошибка при загрузке файла: {ex.Message}";
            HasMedia = false;
        }
    }

    private void Close(bool result = false) => CloseAction?.Invoke(result);
}
