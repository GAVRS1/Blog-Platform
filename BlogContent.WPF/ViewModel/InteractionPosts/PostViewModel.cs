using BlogContent.Core.Models;
using BlogContent.Services;
using BlogContent.WPF.ViewModel.Base;
using BlogContent.WPF.ViewModel.InteractionPosts;
using System.Collections.ObjectModel;

namespace BlogContent.WPF.ViewModel;

public class PostViewModel : ViewModelBase
{
    private readonly Post _originalPost;
    private readonly User _currentUser;
    private readonly CommentService _commentService;

    // Базовые свойства поста
    public int Id => _originalPost.Id;
    public string Title => _originalPost.Title;
    public string Content => _originalPost.Content;
    public string CreatedAtFormatted => _originalPost.CreatedAt.ToString("dd.MM.yyyy HH:mm");
    public int UserId => _originalPost.UserId;
    public string Username => _originalPost.User?.Username ?? "Неизвестный";
    public string UserProfilePicture => _originalPost.User?.Profile?.ProfilePictureUrl ?? "\\default-avatar.png";

    // Медиа-контент
    public bool HasImage => !string.IsNullOrEmpty(_originalPost.ImageUrl);
    public bool HasVideo => !string.IsNullOrEmpty(_originalPost.VideoUrl);
    public bool HasAudio => !string.IsNullOrEmpty(_originalPost.AudioUrl);
    public string ImageUrl => _originalPost.ImageUrl;
    public string VideoUrl => _originalPost.VideoUrl;
    public string AudioUrl => _originalPost.AudioUrl;

    // Лайки поста
    private int _likesCount;
    public int LikesCount
    {
        get => _likesCount;
        set => SetProperty(ref _likesCount, value);
    }

    private bool _isLikedByCurrentUser;
    public bool IsLikedByCurrentUser
    {
        get => _isLikedByCurrentUser;
        set => SetProperty(ref _isLikedByCurrentUser, value);
    }

    // Комментарии
    private bool _areCommentsExpanded;
    public bool AreCommentsExpanded
    {
        get => _areCommentsExpanded;
        set => SetProperty(ref _areCommentsExpanded, value);
    }

    public string CommentsCountText => _originalPost.Comments?.Count == 0
        ? "Нет комментариев"
        : $"{_originalPost.Comments?.Count} {GetCommentPluralForm(_originalPost.Comments?.Count ?? 0)}";

    public ObservableCollection<CommentViewModel> Comments { get; }

    private string _newCommentText;
    public string NewCommentText
    {
        get => _newCommentText;
        set => SetProperty(ref _newCommentText, value);
    }

    // Стили кнопок
    private string _likeButtonText;
    public string LikeButtonText
    {
        get => _likeButtonText;
        set => SetProperty(ref _likeButtonText, value);
    }

    private string _likeButtonColor;
    public string LikeButtonColor
    {
        get => _likeButtonColor;
        set => SetProperty(ref _likeButtonColor, value);
    }

    public Post OriginalPost => _originalPost;

    public PostViewModel(Post post, User currentUser, CommentService commentService)
    {
        _originalPost = post ?? throw new ArgumentNullException(nameof(post));
        _currentUser = currentUser ?? throw new ArgumentNullException(nameof(currentUser));
        _commentService = commentService ?? throw new ArgumentNullException(nameof(commentService));

        Comments = new ObservableCollection<CommentViewModel>();

        InitializePostData();
        UpdateLikeButton();
    }

    private void InitializePostData()
    {
        // Инициализация лайков
        LikesCount = _originalPost.Likes?.Count ?? 0;
        IsLikedByCurrentUser = _originalPost.Likes?.Any(l => l.UserId == _currentUser.Id) ?? false;

        // Инициализация комментариев
        if (_originalPost.Comments != null)
        {
            foreach (Comment? comment in _originalPost.Comments.OrderByDescending(c => c.CreatedAt))
            {
                Comments.Add(new CommentViewModel(comment, _currentUser, _commentService));
            }
        }
    }

    public void LoadComments()
    {
        Comments.Clear();

        IEnumerable<Comment> comments = _commentService.GetCommentsByPostIdWithDetails(_originalPost.Id);
        foreach (Comment? comment in comments.OrderByDescending(c => c.CreatedAt))
        {
            Comments.Add(new CommentViewModel(comment, _currentUser, _commentService));
        }
    }

    public void UpdateLikeButton()
    {
        LikeButtonText = IsLikedByCurrentUser ? "❤️ Понравилось" : "🤍 Нравится";
        LikeButtonColor = IsLikedByCurrentUser ? "#ED4956" : "#65676B";
    }

    private string GetCommentPluralForm(int count)
    {
        if (count % 10 == 1 && count % 100 != 11) return "комментарий";
        if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return "комментария";
        return "комментариев";
    }
}
