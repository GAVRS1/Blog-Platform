using BlogContent.Core.Models;
using BlogContent.Services;
using BlogContent.WPF.Services;
using BlogContent.WPF.Utilities;
using System.Windows;
using System.Windows.Input;
using System.Windows.Media.Imaging;

namespace BlogContent.WPF.ViewModel.Base;

public class NavigationBaseViewModel : ViewModelBase
{
    protected readonly NavigationService _navigationService;
    protected readonly UserService _userService;
    protected readonly PostService _postService;
    protected readonly CommentService _commentService;
    protected readonly LikeService _likeService;
    protected readonly FileService _fileService;

    protected User _currentUser;
    private BitmapImage _userProfilePicture;
    private string _userProfilePictureUrl;
    private string _userFullName;
    private bool _isAdmin;

    // Флаги активных страниц для выделения в меню
    private bool _isHomePage;
    private bool _isProfilePage;
    private bool _isUserPostsPage;
    private bool _isUserLikesPage;

    // Свойства для навигации
    public bool IsHomePage
    {
        get => _isHomePage;
        set => SetProperty(ref _isHomePage, value);
    }

    public bool IsProfilePage
    {
        get => _isProfilePage;
        set => SetProperty(ref _isProfilePage, value);
    }

    public bool UserPostsPage
    {
        get => _isUserPostsPage;
        set => SetProperty(ref _isUserPostsPage, value);
    }

    public bool UserLikesPage
    {
        get => _isUserLikesPage;
        set => SetProperty(ref _isUserLikesPage, value);
    }

    // Свойства пользователя
    public string UserProfilePictureUrl
    {
        get => _userProfilePictureUrl;
        set => SetProperty(ref _userProfilePictureUrl, value);
    }

    public BitmapImage UserProfilePicture
    {
        get => _userProfilePicture;
        set => SetProperty(ref _userProfilePicture, value);
    }

    public string UserFullName
    {
        get => _userFullName;
        set => SetProperty(ref _userFullName, value);
    }

    public bool IsAdmin
    {
        get => _isAdmin;
        set => SetProperty(ref _isAdmin, value);
    }

    // Команды навигации
    public ICommand NavigateToHomeCommand { get; }
    public ICommand ViewProfileCommand { get; }
    public ICommand NavigateToMyPostsCommand { get; }
    public ICommand NavigateToLikesCommand { get; }
    public ICommand CreatePostCommand { get; }
    public ICommand LogoutCommand { get; }

    // Свойство для содержимого страницы
    private object _pageContent;
    public object PageContent
    {
        get => _pageContent;
        set => SetProperty(ref _pageContent, value);
    }

    public NavigationBaseViewModel(
        NavigationService navigationService,
        UserService userService,
        PostService postService,
        CommentService commentService,
        LikeService likeService,
        FileService fileService)
    {
        _navigationService = navigationService;
        _userService = userService;
        _postService = postService;
        _commentService = commentService;
        _likeService = likeService;
        _fileService = fileService;

        // Инициализация команд
        NavigateToHomeCommand = new RelayCommand(_ => NavigateToHome());
        ViewProfileCommand = new RelayCommand(_ => ViewProfile());
        NavigateToMyPostsCommand = new RelayCommand(_ => NavigateToUserPosts());
        NavigateToLikesCommand = new RelayCommand(_ => NavigateUserLikes());
        CreatePostCommand = new RelayCommand(_ => ShowCreatePostDialog());
        LogoutCommand = new RelayCommand(_ => Logout());

        // Загрузка данных пользователя
        LoadCurrentUser();
    }

    public virtual void LoadCurrentUser()
    {
        try
        {
            // Получаем текущего пользователя из сервиса навигации
            _currentUser = _navigationService.GetParameter("CurrentUser") as User;

            if (_currentUser != null)
            {
                // Убедимся, что профиль пользователя загружен полностью
                if (_currentUser.Profile == null)
                {
                    _currentUser = _userService.GetUserById(_currentUser.Id);
                }

                // Установка данных пользователя
                UserFullName = _currentUser.Profile?.FullName ?? "Пользователь";
                UserProfilePictureUrl = _currentUser.Profile?.ProfilePictureUrl;

                try
                {
                    // Получаем полный путь к файлу, проверяем его существование
                    if (!string.IsNullOrEmpty(_currentUser.Profile?.ProfilePictureUrl))
                    {
                        string fullPath = _fileService.GetFullPath(_currentUser.Profile.ProfilePictureUrl);
                        System.Diagnostics.Debug.WriteLine($"Full path to profile picture: {fullPath}");

                        if (System.IO.File.Exists(fullPath))
                        {
                            var image = new BitmapImage();
                            image.BeginInit();
                            image.CreateOptions = BitmapCreateOptions.IgnoreImageCache;
                            image.CacheOption = BitmapCacheOption.OnLoad;
                            image.UriSource = new Uri(fullPath);
                            image.EndInit();
                            UserProfilePicture = image;
                        }
                        else
                        {
                            UserProfilePicture = new BitmapImage(new Uri("\\Assets\\Images\\default_avatar.png", UriKind.Relative));
                        }
                    }
                    else
                    {
                        UserProfilePicture = new BitmapImage(new Uri("\\Assets\\Images\\default_avatar.png", UriKind.Relative));
                    }
                }
                catch (Exception ex)
                {
                    // Если не удалось загрузить изображение, используем заглушку
                    UserProfilePicture = new BitmapImage(new Uri("\\Assets\\Images\\default_avatar.png", UriKind.Relative));
                }

                // Проверяем, является ли пользователь администратором
                IsAdmin = _currentUser.Status == Core.Enums.UserStatus.Admin;
            }
        }
        catch (Exception)
        {
        }
    }

    protected virtual void NavigateToHome()
    {
        try
        {
            // Сбрасываем все флаги страниц
            IsHomePage = false;
            IsProfilePage = false;
            UserPostsPage = false;
            UserLikesPage = false;

            // Устанавливаем флаг активной страницы
            IsHomePage = true;

            // Выполняем фактическую навигацию
            _navigationService.Navigate("Home");
        }
        catch (Exception)
        {
        }
    }

    protected virtual void ViewProfile()
    {
        try
        {
            // Сбрасываем все флаги страниц
            IsHomePage = false;
            IsProfilePage = false;
            UserPostsPage = false;
            UserLikesPage = false;

            // Устанавливаем флаг активной страницы
            IsProfilePage = true;

            // Устанавливаем параметр для просмотра профиля текущего пользователя
            _navigationService.SetParameter("ProfileUser", _currentUser);

            // Выполняем фактическую навигацию
            _navigationService.Navigate("UserProfile");
        }
        catch (Exception)
        {
        }
    }

    protected virtual void NavigateToUserPosts()
    {
        try
        {
            // Сбрасываем все флаги страниц
            IsHomePage = false;
            IsProfilePage = false;
            UserPostsPage = false;
            UserLikesPage = false;

            // Устанавливаем флаг активной страницы
            UserPostsPage = true;

            // Выполняем фактическую навигацию
            _navigationService.Navigate("UserPosts");
        }
        catch (Exception)
        {
        }
    }

    protected virtual void NavigateUserLikes()
    {
        try
        {
            // Сбрасываем все флаги страниц
            IsHomePage = false;
            IsProfilePage = false;
            UserPostsPage = false;
            UserLikesPage = false;

            // Устанавливаем флаг активной страницы
            UserLikesPage = true;

            // Выполняем фактическую навигацию
            _navigationService.Navigate("UserLikes");
        }
        catch (Exception)
        {
        }
    }

    protected virtual void ShowCreatePostDialog()
    {
        // Показываем диалог создания поста
        CreatePost dialog = new(_currentUser)
        {
            Owner = Application.Current.MainWindow
        };

        if (dialog.ShowDialog() == true)
            ReloadContent();
        
    }

    protected virtual void Logout()
    {
        // Выход из системы - сбрасываем данные текущего пользователя
        _navigationService.CurrentUser = null;
        _navigationService.SetParameter("CurrentUser", null);
        _navigationService.SetParameter("ProfileUser", null);

        // Переходим на стартовую страницу и очищаем историю навигации
        _navigationService.NavigateTo("Start", false);
    }

    protected virtual void ReloadContent()
    {
    }
}
