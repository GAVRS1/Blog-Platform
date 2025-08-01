using BlogContent.Core.Models;
using BlogContent.Services;
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

    // Команды, специфичные для HomePage
    public ICommand ViewUserProfileCommand { get; }
    public ICommand AddCommentCommand { get; }
    public ICommand LikePostCommand { get; }
    public ICommand LikeCommentCommand { get; }
    public ICommand AddReplyCommand { get; }
    public RelayCommand CommentPostCommand { get; }

    public HomeViewModel(NavigationService navigationService,
                       UserService userService,
                       PostService postService,
                       CommentService commentService,
                       LikeService likeService,
                       FileService fileService)
        : base(navigationService, userService, postService, commentService, likeService, fileService)
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
        
        LoadPosts();
        // Отмечаем, что мы на домашней странице
        IsHomePage = true;

    }

    private void LoadPosts()
    {
        try
        {
            Posts.Clear();

            if (_currentUser == null)
            {
                return;
            }

            // Получаем все посты с включенными зависимостями
            List<Post>? allPosts = _postService.GetAllPostsWithUsers()?.ToList();

            if (allPosts != null && allPosts.Count > 0)
            {
                List<int> postUserIds = allPosts.Select(p => p.UserId).Distinct().ToList();
                Dictionary<int, User> allUsers = _userService.GetUsersByIds(postUserIds).ToDictionary(u => u.Id);

                IOrderedEnumerable<Post> orderedPosts = allPosts.OrderByDescending(p => p.CreatedAt);

                foreach (Post post in orderedPosts)
                {

                    if (allUsers.TryGetValue(post.UserId, out var user))
                        post.User = user;
                    else
                        continue;

                    // Загружаем лайки для поста
                    post.Likes = _likeService.GetLikesByPostId(post.Id).ToList();

                    // Загружаем комментарии с пользователями
                    post.Comments = _commentService.GetCommentsByPostIdWithUsers(post.Id).ToList();

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
        }
    }

    private void ViewUserProfile(int userId)
    {
        try
        {
            User user = _userService.GetUserById(userId);

            _navigationService.SetParameter("ProfileUser", user);
            _navigationService.Navigate("UserProfile");
        }
        catch (Exception)
        {
        }
    }
    private void ShowComments(int postId)
    {
        try
        {
            // Находим пост в коллекции
            PostViewModel? postViewModel = Posts.FirstOrDefault(p => p.Id == postId);

            if (postViewModel != null)
            {
                // Инвертируем состояние отображения комментариев
                postViewModel.AreCommentsExpanded = !postViewModel.AreCommentsExpanded;

                // Если комментарии раскрыты, загружаем их
                if (postViewModel.AreCommentsExpanded)
                    postViewModel.LoadComments();
                
            }
        }
        catch (Exception)
        {
        }
    }
    private void AddComment(PostViewModel postViewModel)
    {
        if (postViewModel != null && !string.IsNullOrWhiteSpace(postViewModel.NewCommentText))
        {
            try
            {
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
                _commentService.CreateComment(newComment);

                // Очищаем поле ввода
                postViewModel.NewCommentText = string.Empty;

                // Обновляем список комментариев
                postViewModel.LoadComments();
            }
            catch (Exception)
            {
            }
        }
    }
    private void LikePost(int postId)
    {
        try
        {
            // Находим пост в коллекции
            PostViewModel? postViewModel = Posts.FirstOrDefault(p => p.Id == postId);

            if (postViewModel != null)
            {
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
        catch (Exception )
        {
        }
    }
    private void LikeComment(object parameter)
    {
        if (parameter is int commentId)
        {
            try
            {
                Comment comment = _commentService.GetCommentById(commentId);
                if (comment != null)
                {
                    if (comment.Likes.Any(l => l.UserId == _currentUser.Id))
                    {
                        CommentLike like = comment.Likes.First(l => l.UserId == _currentUser.Id);
                        _commentService.RemoveCommentLike(like.Id);
                    }
                    else
                    {
                        CommentLike newLike = new CommentLike
                        {
                            CommentId = commentId,
                            UserId = _currentUser.Id,
                            CreatedAt = DateTime.UtcNow
                        };
                        _commentService.AddCommentLike(newLike);
                    }

                    PostViewModel? postVm = Posts.FirstOrDefault(p => p.Id == comment.PostId);
                    postVm?.LoadComments();
                }
            }
            catch (Exception)
            {
            }
        }
    }

    private void AddReply(object parameter)
    {
        if (parameter is int commentId)
        {
            try
            {
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
                    _commentService.AddReply(reply);

                    // Обновляем пост, к которому принадлежит комментарий
                    Comment comment = _commentService.GetCommentById(commentId);
                    PostViewModel? postVm = Posts.FirstOrDefault(p => p.Id == comment.PostId);
                    postVm?.LoadComments();

                    // Очищаем текст ответа
                    commentVm.ReplyText = string.Empty;
                }
            }
            catch (Exception)
            {
            }
        }
    }
    protected override void ReloadContent() => LoadPosts();
}
