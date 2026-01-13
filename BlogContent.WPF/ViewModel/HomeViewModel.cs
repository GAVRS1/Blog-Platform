using BlogContent.Core.Models;
using BlogContent.Core.Interfaces;
using BlogContent.WPF.Services;
using BlogContent.WPF.Utilities;
using BlogContent.WPF.ViewModel.Base;
using System.Collections.ObjectModel;
using System.Windows.Input;
namespace BlogContent.WPF.ViewModel;

public class HomeViewModel : NavigationBaseViewModel
{
    // Коллекции данных
    public ObservableCollection<PostViewModel> Posts { get; private set; }
    private bool _hasNoPosts;

    public bool HasNoPosts
    {
        get => _hasNoPosts;
        set => SetProperty(ref _hasNoPosts, value);
    }

    // Команды, специфичные для HomePage
    public ICommand ViewUserProfileCommand { get; }
    public ICommand AddCommentCommand { get; }
    public ICommand LikePostCommand { get; }
    public ICommand LikeCommentCommand { get; }
    public ICommand AddReplyCommand { get; }
    public RelayCommand CommentPostCommand { get; }

    public HomeViewModel(NavigationService navigationService,
                       IUserService userService,
                       IPostService postService,
                       ICommentService commentService,
                       ILikeService likeService)
        : base(navigationService, userService, postService, commentService, likeService)
    {
        // Инициализация коллекций
        Posts = new ObservableCollection<PostViewModel>();

        // Инициализация команд, специфичных для HomePage
        ViewUserProfileCommand = new RelayCommand(userId => ViewUserProfile((int)userId));
        AddCommentCommand = new RelayCommand(postVM => AddComment((PostViewModel)postVM));
        CommentPostCommand = new RelayCommand(postId => ShowComments((int)postId));
        LikePostCommand = new RelayCommand(postId => LikePost((int)postId));
        LikeCommentCommand = new RelayCommand(LikeComment);
        AddReplyCommand = new RelayCommand(AddReply);
        
        _ = LoadPostsAsync();
        // Отмечаем, что мы на домашней странице
        IsHomePage = true;

    }

    private async Task LoadPostsAsync()
    {
        try
        {
            ErrorMessage = string.Empty;
            IsLoading = true;
            Posts.Clear();

            if (_currentUser == null)
            {
                return;
            }

            // Получаем все посты с включенными зависимостями
            List<Post>? allPosts = await Task.Run(() => _postService.GetAllPostsWithUsers()?.ToList());

            if (allPosts != null && allPosts.Count > 0)
            {
                IOrderedEnumerable<Post> orderedPosts = allPosts.OrderByDescending(p => p.CreatedAt);

                foreach (Post post in orderedPosts)
                {
                    if (post.User == null)
                    {
                        continue;
                    }

                    // Загружаем лайки для поста
                    post.Likes = await Task.Run(() => _likeService.GetLikesByPostId(post.Id).ToList());

                    // Загружаем комментарии с пользователями
                    post.Comments = await Task.Run(() => _commentService.GetCommentsByPostIdWithUsers(post.Id).ToList());

                    PostViewModel postViewModel = new PostViewModel(post, _currentUser, _commentService);
                    Posts.Add(postViewModel);
                }
            }
            else
            {
                System.Diagnostics.Debug.WriteLine("No posts found");
            }
        }
        catch (Exception)
        {
            ErrorMessage = "Не удалось загрузить посты.";
        }
        finally
        {
            IsLoading = false;
            HasNoPosts = !Posts.Any();
        }
    }

    private async void ViewUserProfile(int userId)
    {
        try
        {
            ErrorMessage = string.Empty;
            User user = await Task.Run(() => _userService.GetUserById(userId));

            _navigationService.SetParameter("ProfileUser", user);
            _navigationService.Navigate("UserProfile");
        }
        catch (Exception)
        {
            ErrorMessage = "Не удалось открыть профиль пользователя.";
        }
    }
    private async void ShowComments(int postId)
    {
        try
        {
            ErrorMessage = string.Empty;
            // Находим пост в коллекции
            PostViewModel? postViewModel = Posts.FirstOrDefault(p => p.Id == postId);

            if (postViewModel != null)
            {
                // Инвертируем состояние отображения комментариев
                postViewModel.AreCommentsExpanded = !postViewModel.AreCommentsExpanded;

                // Если комментарии раскрыты, загружаем их
                if (postViewModel.AreCommentsExpanded)
                    await postViewModel.LoadCommentsAsync();
                
            }
        }
        catch (Exception)
        {
            ErrorMessage = "Не удалось загрузить комментарии.";
        }
    }
    private async void AddComment(PostViewModel postViewModel)
    {
        if (postViewModel != null && !string.IsNullOrWhiteSpace(postViewModel.NewCommentText))
        {
            try
            {
                ErrorMessage = string.Empty;
                // Создаем новый комментарий
                Comment newComment = new Comment
                {
                    Content = postViewModel.NewCommentText,
                    CreatedAt = DateTime.UtcNow,
                    PostId = postViewModel.Id,
                    Post = postViewModel.OriginalPost,
                    UserId = _currentUser.Id,
                    User = _currentUser
                };

                // Сохраняем комментарий
                await Task.Run(() => _commentService.CreateComment(newComment));

                // Очищаем поле ввода
                postViewModel.NewCommentText = string.Empty;

                // Обновляем список комментариев
                await postViewModel.LoadCommentsAsync();
            }
            catch (Exception)
            {
                ErrorMessage = "Не удалось добавить комментарий.";
            }
        }
    }
    private async void LikePost(int postId)
    {
        try
        {
            ErrorMessage = string.Empty;
            // Находим пост в коллекции
            PostViewModel? postViewModel = Posts.FirstOrDefault(p => p.Id == postId);

            if (postViewModel != null)
            {
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
    private async void LikeComment(object parameter)
    {
        if (parameter is int commentId)
        {
            try
            {
                ErrorMessage = string.Empty;
                Comment comment = await Task.Run(() => _commentService.GetCommentById(commentId));
                if (comment != null)
                {
                    if (comment.Likes.Any(l => l.UserId == _currentUser.Id))
                    {
                        await Task.Run(() => _commentService.UnlikeComment(commentId, _currentUser.Id));
                    }
                    else
                    {
                        await Task.Run(() => _commentService.LikeComment(commentId, _currentUser.Id));
                    }

                    PostViewModel? postVm = Posts.FirstOrDefault(p => p.Id == comment.PostId);
                    if (postVm != null)
                    {
                        await postVm.LoadCommentsAsync();
                    }
                }
            }
            catch (Exception)
            {
                ErrorMessage = "Не удалось обновить лайк комментария.";
            }
        }
    }

    private async void AddReply(object parameter)
    {
        if (parameter is int commentId)
        {
            try
            {
                ErrorMessage = string.Empty;
                InteractionPosts.CommentViewModel? commentVm = Posts.SelectMany(p => p.Comments)
                                   .FirstOrDefault(c => c.Id == commentId);

                if (commentVm != null && !string.IsNullOrWhiteSpace(commentVm.ReplyText))
                {
                    CommentReply reply = new CommentReply
                    {
                        CommentId = commentId,
                        Content = commentVm.ReplyText,
                        UserId = _currentUser.Id,
                        CreatedAt = DateTime.UtcNow
                    };
                    await Task.Run(() => _commentService.AddReply(reply.CommentId, reply.Content, reply.UserId));

                    // Обновляем пост, к которому принадлежит комментарий
                    Comment comment = await Task.Run(() => _commentService.GetCommentById(commentId));
                    PostViewModel? postVm = Posts.FirstOrDefault(p => p.Id == comment.PostId);
                    if (postVm != null)
                    {
                        await postVm.LoadCommentsAsync();
                    }

                    // Очищаем текст ответа
                    commentVm.ReplyText = string.Empty;
                }
            }
            catch (Exception)
            {
                ErrorMessage = "Не удалось добавить ответ.";
            }
        }
    }
    protected override void ReloadContent() => _ = LoadPostsAsync();
}
