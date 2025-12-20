using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using BlogContent.WPF.Services;
using BlogContent.WPF.Utilities;
using System.Windows;
using System.Windows.Input;
using System.Windows.Media.Imaging;

namespace BlogContent.WPF.ViewModel.Base;

public class NavigationBaseViewModel : ViewModelBase
{
    protected readonly NavigationService _navigationService;
    protected readonly IUserService _userService;
    protected readonly IPostService _postService;
    protected readonly ICommentService _commentService;
    protected readonly ILikeService _likeService;
    protected readonly IFileService _fileService;

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
        IUserService userService,
        IPostService postService,
        ICommentService commentService,
        ILikeService likeService,
        IFileService fileService)
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

        // Инициализируем текущего пользователя
        _currentUser = _userService.GetCurrentUser();

        // Загружаем данные пользователя при инициализации
        LoadCurrentUserData();
    }

    protected virtual void LoadCurrentUserData()
    {
        try
        {
            if (_currentUser != null)
            {
                // Обновляем информацию о пользователе
                _currentUser = _userService.GetUserById(_currentUser.Id);
                UserFullName = _currentUser.Profile?.FullName;
                IsAdmin = _currentUser.Status == Core.Enums.UserStatus.Admin;

                // Загружаем аватар
                if (!string.IsNullOrEmpty(_currentUser.Profile?.ProfilePictureUrl))
                {
                    string fullPath = _fileService.GetFullPath(_currentUser.Profile.ProfilePictureUrl);
                    if (_fileService.FileExists(fullPath))
                    {
                        UserProfilePictureUrl = fullPath;
                        UserProfilePicture = new BitmapImage(new Uri(fullPath));
                    }
                }
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Ошибка при загрузке данных пользователя: {ex.Message}", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    // Методы для навигации
    protected void NavigateToHome()
    {
        _navigationService.Navigate("Home");
        ResetPageFlags();
        IsHomePage = true;
    }

    protected void ViewProfile()
    {
        _navigationService.Navigate("UserProfile");
        ResetPageFlags();
        IsProfilePage = true;
    }

    protected void NavigateToUserPosts()
    {
        _navigationService.Navigate("UserPosts");
        ResetPageFlags();
        UserPostsPage = true;
    }

    protected void NavigateUserLikes()
    {
        _navigationService.Navigate("UserLikes");
        ResetPageFlags();
        UserLikesPage = true;
    }

    protected void ShowCreatePostDialog()
    {
        // Здесь будет логика показа диалога для создания нового поста
        MessageBox.Show("Функционал создания поста пока не реализован", "Информация", MessageBoxButton.OK, MessageBoxImage.Information);
    }

    protected void Logout()
    {
        // Сбрасываем текущего пользователя
        _currentUser = null;
        _navigationService.SetParameter("CurrentUser", null);

        // Перенаправляем на страницу входа
        _navigationService.Navigate("Login");

        // Сбрасываем флаги страниц
        ResetPageFlags();
    }

    protected void ResetPageFlags()
    {
        IsHomePage = false;
        IsProfilePage = false;
        UserPostsPage = false;
        UserLikesPage = false;
    }

    protected void UpdateCurrentUser(User user)
    {
        _currentUser = user;
        _navigationService.SetParameter("CurrentUser", user);
        LoadCurrentUserData();
    }
}
