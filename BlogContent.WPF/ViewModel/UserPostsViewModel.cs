using BlogContent.Core.Models;
using BlogContent.Services;
using BlogContent.WPF.Utilities;
using BlogContent.WPF.ViewModel.Base;
using System.Collections.ObjectModel;
using System.Windows.Input;
using System.Windows;
using BlogContent.WPF.Services;

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
                             UserService userService,
                             PostService postService,
                             CommentService commentService,
                             LikeService likeService,
                             FileService fileService)
        : base(navigationService, userService, postService, commentService, likeService, fileService)
    {
        UserPosts = new ObservableCollection<PostViewModel>();

        // Инициализация команд
        LikePostCommand = new RelayCommand(postId => LikePost((int)postId));
        CommentPostCommand = new RelayCommand(postId => ShowComments((int)postId));
        DeletePostCommand = new RelayCommand(postId => DeletePost((int)postId));
        AddCommentCommand = new RelayCommand(postVM => AddComment((PostViewModel)postVM));
        // Отмечаем, что мы находимся на странице "Мои посты"
        UserPostsPage = true;

        // Загружаем посты пользователя
        LoadUserPosts();
    }

    private void LoadUserPosts()
    {

        if (_currentUser == null)
        {
            MessageBox.Show("Не удалось получить данные пользователя. Попробуйте выйти и войти снова.",
                           "Ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
            return;
        }

        UserPosts.Clear();

        try
        {
            // Получаем посты текущего пользователя
            IOrderedEnumerable<Post> userPosts = _postService.GetPostsByUser(_currentUser.Id)
                                       .OrderByDescending(p => p.CreatedAt);

            foreach (Post post in userPosts)
            {
                if (post.User == null)
                    post.User = _userService.GetUserById(post.UserId);
                

                if (post.Likes == null || !post.Likes.Any())
                    post.Likes = _likeService.GetLikesByPostId(post.Id).ToList(); 
                

                if (post.Comments == null || !post.Comments.Any())
                    post.Comments = _commentService.GetCommentsByPostId(post.Id).ToList();


                PostViewModel postViewModel = new PostViewModel(post, _currentUser, _commentService);
                UserPosts.Add(postViewModel);
            }

            // Устанавливаем флаг отсутствия постов
            HasNoPosts = !UserPosts.Any();
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Произошла ошибка при загрузке постов: {ex.Message}",
                           "Ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    private void LikePost(int postId)
    {
        try
        {
            // Находим пост в коллекции
            PostViewModel? postViewModel = UserPosts.FirstOrDefault(p => p.Id == postId);

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
                    }
                }
                else
                {
                    // Создаем новый лайк
                    Like newLike = new Like
                    {
                        PostId = postId,
                        UserId = _currentUser.Id,
                        Post = postViewModel.OriginalPost,
                        User = _currentUser
                    };

                    _likeService.CreateLike(newLike);

                    // Обновляем отображение
                    postViewModel.IsLikedByCurrentUser = true;
                    postViewModel.LikesCount++;
                    postViewModel.UpdateLikeButton();
                }
            }
        }
        catch (Exception)
        {
        }
    }

    private void ShowComments(int postId)
    {
        PostViewModel? postViewModel = UserPosts.FirstOrDefault(p => p.Id == postId);
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
            catch (Exception)
            {
            }
        }
    }

    private void DeletePost(int postId)
    {
        try
        {
            MessageBoxResult result = MessageBox.Show("Вы действительно хотите удалить этот пост?",
                                       "Подтверждение удаления",
                                       MessageBoxButton.YesNo,
                                       MessageBoxImage.Question);

            if (result == MessageBoxResult.Yes)
            {
                // Удаляем пост
                _postService.DeletePost(postId);

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
            MessageBox.Show($"Произошла ошибка при удалении поста: {ex.Message}",
                           "Ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    protected override void ReloadContent() => LoadUserPosts();
}
