using BlogContent.Core.Models;
using BlogContent.Core.Interfaces;
using BlogContent.WPF.Utilities;
using BlogContent.WPF.ViewModel.Base;
using System.Collections.ObjectModel;
using System.Windows.Input;
using System.Windows;

namespace BlogContent.WPF.ViewModel;

public class UserPostsViewModel : NavigationBaseViewModel
{
    private ObservableCollection<PostViewModel> _userPosts;
    private bool _hasNoPosts;

    public ObservableCollection<PostViewModel> UserPosts
    {
        get => _userPosts;
        set => SetProperty(ref _userPosts, value);
    }

    public bool HasNoPosts
    {
        get => _hasNoPosts;
        set => SetProperty(ref _hasNoPosts, value);
    }

    // Команды для действий с постами
    public ICommand LikePostCommand { get; }
    public ICommand CommentPostCommand { get; }
    public ICommand DeletePostCommand { get; }
    public ICommand AddCommentCommand { get; }
    public UserPostsViewModel(NavigationService navigationService,
                             IUserService userService,
                             IPostService postService,
                             ICommentService commentService,
                             ILikeService likeService)
        : base(navigationService, userService, postService, commentService, likeService)
    {
        UserPosts = new ObservableCollection<PostViewModel>();

        // Инициализация команд
        LikePostCommand = new RelayCommand(postId => LikePost((int)postId));
        CommentPostCommand = new RelayCommand(postId => ShowComments((int)postId));
        DeletePostCommand = new RelayCommand(async postId => await DeletePostAsync((int)postId));
        AddCommentCommand = new RelayCommand(postVM => AddComment((PostViewModel)postVM));
        // Отмечаем, что мы находимся на странице "Мои посты"
        UserPostsPage = true;

        // Загружаем посты пользователя
        _ = LoadUserPostsAsync();
    }

    private async Task LoadUserPostsAsync()
    {
        if (_currentUser == null)
        {
            ErrorMessage = "Не удалось получить данные пользователя. Попробуйте выйти и войти снова.";
            return;
        }

        UserPosts.Clear();

        try
        {
            ErrorMessage = string.Empty;
            IsLoading = true;
            // Получаем посты текущего пользователя
            IOrderedEnumerable<Post> userPosts = (await Task.Run(() => _postService.GetPostsByUser(_currentUser.Id, 1, int.MaxValue)))
                                       .Items
                                       .OrderByDescending(p => p.CreatedAt);

            foreach (Post post in userPosts)
            {
                if (post.User == null)
                    post.User = await Task.Run(() => _userService.GetUserById(post.UserId));
                

                if (post.Likes == null || !post.Likes.Any())
                    post.Likes = await Task.Run(() => _likeService.GetLikesByPostId(post.Id).ToList()); 
                

                if (post.Comments == null || !post.Comments.Any())
                    post.Comments = await Task.Run(() => _commentService.GetCommentsByPostId(post.Id, 1, int.MaxValue).Items.ToList());


                PostViewModel postViewModel = new PostViewModel(post, _currentUser, _commentService);
                UserPosts.Add(postViewModel);
            }

            // Устанавливаем флаг отсутствия постов
            HasNoPosts = !UserPosts.Any();
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Произошла ошибка при загрузке постов: {ex.Message}";
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
            PostViewModel? postViewModel = UserPosts.FirstOrDefault(p => p.Id == postId);

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
                }
                else
                {
                    await Task.Run(() => _postService.AddLike(postId, _currentUser.Id));

                    // Обновляем отображение
                    postViewModel.IsLikedByCurrentUser = true;
                    postViewModel.LikesCount++;
                    postViewModel.UpdateLikeButton();
                }
            }
        }
        catch (Exception)
        {
            ErrorMessage = "Не удалось обновить лайк.";
        }
    }

    private async void ShowComments(int postId)
    {
        PostViewModel? postViewModel = UserPosts.FirstOrDefault(p => p.Id == postId);
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
            catch (Exception)
            {
                ErrorMessage = "Не удалось добавить комментарий.";
            }
        }
    }

    private async Task DeletePostAsync(int postId)
    {
        try
        {
            ErrorMessage = string.Empty;
            MessageBoxResult result = MessageBox.Show("Вы действительно хотите удалить этот пост?",
                                       "Подтверждение удаления",
                                       MessageBoxButton.YesNo,
                                       MessageBoxImage.Question);

            if (result == MessageBoxResult.Yes)
            {
                // Удаляем пост
                await Task.Run(() => _postService.DeletePost(postId));

                // Удаляем пост из коллекции
                PostViewModel? postToRemove = UserPosts.FirstOrDefault(p => p.Id == postId);
                if (postToRemove != null)
                    UserPosts.Remove(postToRemove);
                
                // Обновляем флаг отсутствия постов
                HasNoPosts = !UserPosts.Any();
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Произошла ошибка при удалении поста: {ex.Message}";
        }
    }

    protected override void ReloadContent() => _ = LoadUserPostsAsync();
}
