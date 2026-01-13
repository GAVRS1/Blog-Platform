using BlogContent.Core.Models;
using BlogContent.Core.Interfaces;
using BlogContent.WPF.Utilities;
using BlogContent.WPF.ViewModel.Base;
using System.Collections.ObjectModel;
using System.Windows.Input;
using System.Windows;

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
                             ILikeService likeService)
        : base(navigationService, userService, postService, commentService, likeService)
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
        _ = LoadLikedPostsAsync();
    }

    private async Task LoadLikedPostsAsync()
    {

        LikedPosts.Clear();

        try
        {
            ErrorMessage = string.Empty;
            IsLoading = true;
            // Получаем лайки пользователя
            IEnumerable<Like> userLikes = await Task.Run(() => _likeService.GetLikesByUserId(_currentUser.Id));

            // Получаем посты, которые лайкнул пользователь
            var likedPostIds = userLikes.Select(l => l.PostId).ToList();
            IOrderedEnumerable<Post> posts = (await Task.Run(() => _postService.GetPostsById(likedPostIds)))
                                  .OrderByDescending(p => p.CreatedAt);

            foreach (Post? post in posts)
            {
                if (post.User == null)
                    post.User = await Task.Run(() => _userService.GetUserById(post.UserId));
                

                if (post.Likes == null || !post.Likes.Any())
                    post.Likes = await Task.Run(() => _likeService.GetLikesByPostId(post.Id).ToList());

                if (post.Comments == null || !post.Comments.Any())
                    post.Comments = await Task.Run(() => _commentService.GetCommentsByPostId(post.Id, 1, int.MaxValue).Items.ToList());


                PostViewModel postViewModel = new PostViewModel(post, _currentUser, _commentService);
                LikedPosts.Add(postViewModel);
            }

            HasNoLikes = !LikedPosts.Any();
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Произошла ошибка при загрузке понравившихся постов: {ex.Message}";
        }
        finally
        {
            IsLoading = false;
        }
    }

    private async void LikePost(int postId)
    {
        try
        {
            ErrorMessage = string.Empty;
            // Находим пост в коллекции
            PostViewModel? postViewModel = LikedPosts.FirstOrDefault(p => p.Id == postId);

            if (postViewModel != null)
            {
                // Если пост уже лайкнут текущим пользователем - удаляем лайк
                if (postViewModel.IsLikedByCurrentUser)
                {
                    await Task.Run(() => _postService.RemoveLike(postId, _currentUser.Id));

                    // Обновляем отображение
                    postViewModel.IsLikedByCurrentUser = false;
                    postViewModel.LikesCount = Math.Max(0, postViewModel.LikesCount - 1);
                    postViewModel.UpdateLikeButton();

                    // Удаляем пост из коллекции, так как это страница лайков
                    LikedPosts.Remove(postViewModel);

                    // Обновляем флаг отсутствия лайкнутых постов
                    HasNoLikes = !LikedPosts.Any();
                }
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Не удалось обновить лайк: {ex.Message}";
        }
    }

    private async void ShowComments(int postId)
    {
        PostViewModel? postViewModel = LikedPosts.FirstOrDefault(p => p.Id == postId);
        if (postViewModel != null)
        {
            postViewModel.AreCommentsExpanded = !postViewModel.AreCommentsExpanded;
            if (postViewModel.AreCommentsExpanded)
                await postViewModel.LoadCommentsAsync();
            
        }
    }

    private async void AddComment(PostViewModel postViewModel)
    {
        if (postViewModel != null && !string.IsNullOrWhiteSpace(postViewModel.NewCommentText))
        {
            try
            {
                ErrorMessage = string.Empty;
                Comment newComment = new Comment
                {
                    Content = postViewModel.NewCommentText,
                    CreatedAt = DateTime.UtcNow,
                    PostId = postViewModel.Id,
                    UserId = _currentUser.Id
                };

                await Task.Run(() => _commentService.CreateComment(newComment));
                postViewModel.NewCommentText = string.Empty;
                await postViewModel.LoadCommentsAsync();
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Не удалось добавить комментарий: {ex.Message}";
            }
        }
    }

    private async void ViewUserProfile(int userId)
    {
        try
        {
            ErrorMessage = string.Empty;
            User user = await Task.Run(() => _userService.GetUserById(userId));

            _navigationService.SetParameter("ProfileUser", user);

            // Переходим на страницу профиля
            _navigationService.Navigate("UserProfile");
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Не удалось открыть профиль пользователя: {ex.Message}";
        }
    }

    protected override void ReloadContent() => _ = LoadLikedPostsAsync();

}
