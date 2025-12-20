using BlogContent.Core.Models;
using BlogContent.Core.Interfaces;
using BlogContent.WPF.Utilities;
using BlogContent.WPF.ViewModel.Base;
using System.Collections.ObjectModel;
using System.Windows.Input;
using System.Windows;
using BlogContent.WPF.Services;

namespace BlogContent.WPF.ViewModel;

public class UserLikesViewModel : NavigationBaseViewModel
{
    private ObservableCollection<PostViewModel> _likedPosts;
    private bool _hasNoLikes;

    public ObservableCollection<PostViewModel> LikedPosts
    {
        get => _likedPosts;
        set => SetProperty(ref _likedPosts, value);
    }

    public bool HasNoLikes
    {
        get => _hasNoLikes;
        set => SetProperty(ref _hasNoLikes, value);
    }

    // Команды для действий с постами
    public ICommand LikePostCommand { get; }
    public ICommand AddCommentCommand { get; }
    public ICommand CommentPostCommand { get; }
    public ICommand ViewUserProfileCommand { get; }

    public UserLikesViewModel(NavigationService navigationService,
                             IUserService userService,
                             IPostService postService,
                             ICommentService commentService,
                             ILikeService likeService,
                             IFileService fileService)
        : base(navigationService, userService, postService, commentService, likeService, fileService)
    {
        LikedPosts = new ObservableCollection<PostViewModel>();

        // Инициализация команд
        LikePostCommand = new RelayCommand(postId => LikePost((int)postId));
        ViewUserProfileCommand = new RelayCommand(userId => ViewUserProfile((int)userId));
        CommentPostCommand = new RelayCommand(postId => ShowComments((int)postId));
        AddCommentCommand = new RelayCommand(postVM => AddComment((PostViewModel)postVM));
        // Отмечаем, что мы находимся на странице "Понравившиеся"
        UserLikesPage = true;

        // Загружаем лайкнутые посты
        LoadLikedPosts();
    }

    private void LoadLikedPosts()
    {

        LikedPosts.Clear();

        try
        {
            // Получаем лайки пользователя
            IEnumerable<Like> userLikes = _likeService.GetLikesByUserId(_currentUser.Id);

            // Получаем посты, которые лайкнул пользователь
            var likedPostIds = userLikes.Select(l => l.PostId).ToList();
            IOrderedEnumerable<Post> posts = _postService.GetPostsById(likedPostIds)
                                  .OrderByDescending(p => p.CreatedAt);

            foreach (Post? post in posts)
            {
                if (post.User == null)
                    post.User = _userService.GetUserById(post.UserId);
                

                if (post.Likes == null || !post.Likes.Any())
                    post.Likes = _likeService.GetLikesByPostId(post.Id).ToList();

                if (post.Comments == null || !post.Comments.Any())
                    post.Comments = _commentService.GetCommentsByPostId(post.Id, 1, int.MaxValue).Items.ToList();


                PostViewModel postViewModel = new PostViewModel(post, _currentUser, _commentService);
                LikedPosts.Add(postViewModel);
            }

            HasNoLikes = !LikedPosts.Any();
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Произошла ошибка при загрузке понравившихся постов: {ex.Message}",
                           "Ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    private void LikePost(int postId)
    {
        try
        {
            // Находим пост в коллекции
            PostViewModel? postViewModel = LikedPosts.FirstOrDefault(p => p.Id == postId);

            if (postViewModel != null)
            {
                // Если пост уже лайкнут текущим пользователем - удаляем лайк
                if (postViewModel.IsLikedByCurrentUser)
                {
                    // Находим лайк пользователя
                    Like? likeToRemove = postViewModel.OriginalPost.Likes.FirstOrDefault(l => l.UserId == _currentUser.Id);

                    if (likeToRemove != null)
                    {
                        // Удаляем лайк
                        _likeService.DeleteLike(likeToRemove.Id);

                        // Обновляем отображение
                        postViewModel.IsLikedByCurrentUser = false;
                        postViewModel.LikesCount--;
                        postViewModel.UpdateLikeButton();

                        // Удаляем пост из коллекции, так как это страница лайков
                        LikedPosts.Remove(postViewModel);

                        // Обновляем флаг отсутствия лайкнутых постов
                        HasNoLikes = !LikedPosts.Any();
                    }
                }
            }
        }
        catch (Exception ex)
        {
        }
    }

    private void ShowComments(int postId)
    {
        PostViewModel? postViewModel = LikedPosts.FirstOrDefault(p => p.Id == postId);
        if (postViewModel != null)
        {
            postViewModel.AreCommentsExpanded = !postViewModel.AreCommentsExpanded;
            if (postViewModel.AreCommentsExpanded)
                postViewModel.LoadComments();
            
        }
    }

    private void AddComment(PostViewModel postViewModel)
    {
        if (postViewModel != null && !string.IsNullOrWhiteSpace(postViewModel.NewCommentText))
        {
            try
            {
                Comment newComment = new Comment
                {
                    Content = postViewModel.NewCommentText,
                    CreatedAt = DateTime.UtcNow,
                    PostId = postViewModel.Id,
                    UserId = _currentUser.Id
                };

                _commentService.CreateComment(newComment);
                postViewModel.NewCommentText = string.Empty;
                postViewModel.LoadComments();
            }
            catch (Exception ex)
            {
            }
        }
    }

    private void ViewUserProfile(int userId)
    {
        try
        {
            User user = _userService.GetUserById(userId);

            _navigationService.SetParameter("ProfileUser", user);

            // Переходим на страницу профиля
            _navigationService.Navigate("UserProfile");
        }
        catch (Exception ex)
        {
        }
    }

    protected override void ReloadContent() => LoadLikedPosts();

}
