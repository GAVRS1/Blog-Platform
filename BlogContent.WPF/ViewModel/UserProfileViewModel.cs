using BlogContent.Core.Models;
using BlogContent.Core.Interfaces;
using BlogContent.WPF.Services;
using BlogContent.WPF.ViewModel.Base;
using System.Collections.ObjectModel;
using System.Windows.Media.Imaging;

namespace BlogContent.WPF.ViewModel;

public class UserProfileViewModel : NavigationBaseViewModel
    {
        private readonly MediaUrlResolver _mediaUrlResolver;
        private User _profileUser;
        private BitmapImage _profilePicture;
        private string _username;
        private string _fullName;
        private string _birthDate;
        private string _age;
        private string _bio;
        private int _postsCount;
        private int _commentsCount;
        private bool _hasNoPosts;

        public UserProfileViewModel(NavigationService navigationService, 
                                   IUserService userService, 
                                   IPostService postService, 
                                   ICommentService commentService,
                                   ILikeService likeService,
                                   MediaUrlResolver mediaUrlResolver) 
            : base(navigationService, userService, postService, commentService, likeService)
        {
            _mediaUrlResolver = mediaUrlResolver ?? throw new ArgumentNullException(nameof(mediaUrlResolver));
            UserPosts = new ObservableCollection<PostViewModel>();

            _ = LoadUserProfileAsync();
            _ = LoadUserPostsAsync();
            
            // Установим флаг активной страницы
            IsProfilePage = true;
        }

        public BitmapImage ProfilePicture
        {
            get => _profilePicture;
            set => SetProperty(ref _profilePicture, value);
        }

        public string Username
        {
            get => _username;
            set => SetProperty(ref _username, value);
        }

        public string FullName
        {
            get => _fullName;
            set => SetProperty(ref _fullName, value);
        }

        public string BirthDate
        {
            get => _birthDate;
            set => SetProperty(ref _birthDate, value);
        }

        public string Age
        {
            get => _age;
            set => SetProperty(ref _age, value);
        }

        public string Bio
        {
            get => _bio;
            set => SetProperty(ref _bio, value);
        }

        public int PostsCount
        {
            get => _postsCount;
            set => SetProperty(ref _postsCount, value);
        }

        public int CommentsCount
        {
            get => _commentsCount;
            set => SetProperty(ref _commentsCount, value);
        }

        public bool HasNoPosts
        {
            get => _hasNoPosts;
            set => SetProperty(ref _hasNoPosts, value);
        }

        public ObservableCollection<PostViewModel> UserPosts { get; private set; }

        private async Task LoadUserProfileAsync()
        {
            // Получаем пользователя, чей профиль открыт
            _profileUser = (User)_navigationService.GetParameter("ProfileUser");

            if (_profileUser == null)
            {
                NavigateToHome();
                return;
            }

            // Загружаем данные пользователя
            Username = _profileUser.Username;
            FullName = _profileUser.Profile.FullName;
            BirthDate = _profileUser.Profile.BirthDate.ToString("dd.MM.yyyy");
            Age = _profileUser.Profile.Age.ToString();
            Bio = _profileUser.Profile.Bio;

            // Загружаем статистику
            PostsCount = _profileUser.Posts?.Count ?? 0;
            CommentsCount = _profileUser.Comments?.Count ?? 0;

            // Загружаем фото профиля
            try
            {
                ErrorMessage = string.Empty;
                var imageUrl = _mediaUrlResolver.ToAbsoluteUrl(_profileUser.Profile.ProfilePictureUrl);
                if (string.IsNullOrWhiteSpace(imageUrl))
                {
                    ProfilePicture = new BitmapImage(new Uri("\\Assets\\Images\\default_avatar.png", UriKind.Relative));
                }
                else
                {
                    BitmapImage image = new BitmapImage();
                    image.BeginInit();
                    image.CacheOption = BitmapCacheOption.OnLoad;
                    image.UriSource = new Uri(imageUrl, UriKind.RelativeOrAbsolute);
                    image.EndInit();
                    ProfilePicture = image;
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Не удалось загрузить фото профиля: {ex.Message}";
                ProfilePicture = new BitmapImage(new Uri("\\Assets\\Images\\default_avatar.png", UriKind.Relative));
            }
        }

        private async Task LoadUserPostsAsync()
        {
            if (_profileUser == null) return;

            try
            {
                ErrorMessage = string.Empty;
                IsLoading = true;
                UserPosts.Clear();

                IEnumerable<Post> userPosts = (await Task.Run(() => _postService.GetPostsByUser(_profileUser.Id, 1, int.MaxValue))).Items;

                if (userPosts == null || !userPosts.Any())
                {
                    HasNoPosts = true;
                    return;
                }

                HasNoPosts = false;

                IEnumerable<Post> orderedPosts = userPosts.OrderByDescending(p => p.CreatedAt).Take(3);

                User? currentUser = _navigationService.GetParameter("CurrentUser") as User;

                foreach (Post post in orderedPosts)
                {
                    PostViewModel postViewModel = new PostViewModel(post, currentUser, _commentService);
                    UserPosts.Add(postViewModel);
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Не удалось загрузить посты пользователя: {ex.Message}";
                HasNoPosts = true;
            }
            finally
            {
                IsLoading = false;
            }
        }
    }
