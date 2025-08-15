using BlogContent.Core.Models;
using BlogContent.Services;
using BlogContent.WPF.Utilities;
using BlogContent.WPF.ViewModel.Base;
using System.Collections.ObjectModel;
using System.Windows.Input;

namespace BlogContent.WPF.ViewModel.InteractionPosts;

public class CommentViewModel : ViewModelBase
{
    private Comment _comment;
    private readonly User _currentUser;
    private readonly CommentService _commentService;

    public int Id => _comment.Id;
    public string Content => _comment.Content;
    public string Username => _comment.User.Username;
    public string CreatedAtFormatted => _comment.CreatedAt.ToString("dd.MM.yyyy HH:mm");
    public string UserProfilePicture => _comment.User.Profile.ProfilePictureUrl;

    private bool _areRepliesExpanded;
    public bool AreRepliesExpanded
    {
        get => _areRepliesExpanded;
        set => SetProperty(ref _areRepliesExpanded, value);
    }

    private bool _isReplying;
    public bool IsReplying
    {
        get => _isReplying;
        set => SetProperty(ref _isReplying, value);
    }

    private string _replyText;
    public string ReplyText
    {
        get => _replyText;
        set => SetProperty(ref _replyText, value);
    }

    private int _likesCount;
    public int LikesCount
    {
        get => _likesCount;
        private set => SetProperty(ref _likesCount, value);
    }

    private bool _isLikedByCurrentUser;
    public bool IsLikedByCurrentUser
    {
        get => _isLikedByCurrentUser;
        private set => SetProperty(ref _isLikedByCurrentUser, value);
    }

    public int RepliesCount => _comment.Replies.Count;
    public bool HasReplies => RepliesCount > 0;

    public string RepliesCountText => RepliesCount == 0 ? "" :
                                     (RepliesCount == 1 ? "1 ответ" :
                                     (RepliesCount > 1 && RepliesCount < 5 ? $"{RepliesCount} ответа" :
                                     $"{RepliesCount} ответов"));

    public ObservableCollection<CommentReplyViewModel> Replies { get; } = new ObservableCollection<CommentReplyViewModel>();

    public ICommand ToggleRepliesCommand { get; }
    public ICommand LikeCommentCommand { get; }
    public ICommand AddReplyCommand { get; }
    public ICommand ToggleReplyInputCommand { get; }
    public ICommand SubmitReplyCommand { get; }

    public CommentViewModel(Comment comment, User currentUser, CommentService commentService)
    {
        _comment = comment;
        _currentUser = currentUser;
        _commentService = commentService;

        _likesCount = _comment.Likes?.Count ?? 0;
        _isLikedByCurrentUser = _comment.Likes?.Any(l => l.UserId == _currentUser.Id) ?? false;

        Replies = new ObservableCollection<CommentReplyViewModel>();
        LoadReplies();

        LikeCommentCommand = new RelayCommand(_ => LikeComment());
        ToggleRepliesCommand = new RelayCommand(_ => ToggleReplies());
        AddReplyCommand = new RelayCommand(_ => AddReply());
        ToggleReplyInputCommand = new RelayCommand(_ => ToggleReplyInput());
        SubmitReplyCommand = new RelayCommand(_ => SubmitReply());
    }

    private void LoadLikes()
    {
        IEnumerable<CommentLike> likes = _commentService.GetLikesByCommentId(_comment.Id);
        LikesCount = likes.Count();
        IsLikedByCurrentUser = likes.Any(l => l.UserId == _currentUser.Id);
    }

    private void ToggleReplies()
    {
        AreRepliesExpanded = !AreRepliesExpanded;
        if (AreRepliesExpanded && !Replies.Any())
        {
            LoadReplies();
        }
    }

    private void ToggleReplyInput() => IsReplying = !IsReplying;

    private void LikeComment()
    {
        if (IsLikedByCurrentUser)
        {
            _commentService.UnlikeComment(_comment.Id, _currentUser.Id);
            LikesCount--;
        }
        else
        {
            _commentService.LikeComment(_comment.Id, _currentUser.Id);
            LikesCount++;
        }
        IsLikedByCurrentUser = !IsLikedByCurrentUser;
    }

    private void AddReply()
    {
        if (!string.IsNullOrWhiteSpace(ReplyText))
        {
            _commentService.AddReply(_comment.Id, ReplyText, _currentUser.Id);
            ReplyText = string.Empty;
            LoadReplies();
        }
    }

    public void SubmitReply()
    {
        if (!string.IsNullOrWhiteSpace(ReplyText))
        {
            AddReply();
            IsReplying = false;
        }
    }

    private void LoadReplies()
    {
        Replies.Clear();
        IOrderedEnumerable<CommentReply> replies = _commentService.GetRepliesByCommentId(_comment.Id)
            .OrderBy(r => r.CreatedAt);

        foreach (var reply in replies)
        {
            Replies.Add(new CommentReplyViewModel(reply));
        }
    }
}

public class CommentReplyViewModel : ViewModelBase
{
    private readonly CommentReply _reply;

    public int Id => _reply.Id;
    public string Content => _reply.Content;
    public string Username => _reply.User.Username;
    public string CreatedAtFormatted => _reply.CreatedAt.ToString("dd.MM.yyyy HH:mm");
    public string UserProfilePicture => _reply.User.Profile.ProfilePictureUrl;

    public CommentReplyViewModel(CommentReply reply)
    {
        _reply = reply;
    }
}