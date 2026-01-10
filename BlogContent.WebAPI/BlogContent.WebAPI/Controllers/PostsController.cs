using BlogContent.Core.Enums;
using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using BlogContent.Services;
using BlogContent.WebAPI.DTOs;
using BlogContent.WebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Security.Claims;

namespace BlogContent.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PostsController : ControllerBase
{
    private const int DefaultPageSize = 10;
    private const int MaxPageSize = 100;

    private const string AccessDeniedMessage = "Пользователь ограничил круг лиц, которым доступно это действие.";
    private const string BlockedMessage = "Доступ ограничен из-за блокировки пользователя.";

    private readonly IPostService _postService;
    private readonly IUserService _userService;
    private readonly IFollowService _followService;
    private readonly IBlockService _blockService;

    public PostsController(
        IPostService postService,
        IUserService userService,
        IFollowService followService,
        IBlockService blockService)
    {
        _postService = postService;
        _userService = userService;
        _followService = followService;
        _blockService = blockService;
    }

    [HttpGet]
    public IActionResult GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = DefaultPageSize)
    {
        (page, pageSize) = NormalizePagination(page, pageSize);
        var currentUserId = TryGetUserId(out var userId) ? userId : (int?)null;

        if (currentUserId.HasValue)
        {
            var blockedUsers = _blockService.GetBlockedUserIds(currentUserId.Value);
            if (blockedUsers.Count > 0)
            {
                var filteredPosts = _postService.GetAllPostsWithUsers()
                    .Where(post => !blockedUsers.Contains(post.UserId))
                    .ToList();

                var total = filteredPosts.Count;
                var items = filteredPosts
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                var mapped = items.Select(p => ToResponse(p, currentUserId)).ToList();
                return Ok(new PagedResponse<PostResponseDto>(mapped, total, page, pageSize));
            }
        }

        var posts = _postService.GetAllPosts(page, pageSize);
        var mappedDefault = posts.Items.Select(p => ToResponse(p, currentUserId)).ToList();

        return Ok(ToPagedResponse(new PagedResult<PostResponseDto>(mappedDefault, posts.TotalCount), page, pageSize));
    }

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var post = _postService.GetPostById(id);
        var currentUserId = TryGetUserId(out var userId) ? userId : (int?)null;

        if (post != null && currentUserId.HasValue && post.UserId != currentUserId.Value)
        {
            var relation = _blockService.GetRelationship(currentUserId.Value, post.UserId);
            if (relation.IBlocked || relation.BlockedMe)
            {
                return StatusCode(403, new AccessDeniedResponse { Message = BlockedMessage });
            }
        }

        return post == null ? NotFound() : Ok(ToResponse(post, currentUserId));
    }

    [HttpGet("user/{userId}")]
    public IActionResult GetByUserId(int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = DefaultPageSize)
    {
        var authUserId = TryGetUserId(out var uid) ? uid : (int?)null;

        var user = _userService.GetUserById(userId);
        if (user == null)
        {
            return NotFound();
        }

        if (authUserId.HasValue && authUserId.Value != userId)
        {
            var blockRelation = _blockService.GetRelationship(authUserId.Value, userId);
            if (blockRelation.IBlocked || blockRelation.BlockedMe)
            {
                return StatusCode(403, new AccessDeniedResponse { Message = BlockedMessage });
            }

            var relation = _followService.GetRelationship(authUserId.Value, userId);
            var audience = user.PrivacySettings?.ProfileVisibility ?? Audience.Everyone;

            if (!SettingsAccessChecker.CanAccess(audience, relation.AreFriends))
            {
                return StatusCode(403, new AccessDeniedResponse { Message = AccessDeniedMessage });
            }
        }

        (page, pageSize) = NormalizePagination(page, pageSize);
        var posts = _postService.GetPostsByUser(userId, page, pageSize);

        var mapped = posts.Items
            .Select(p => ToResponse(p, authUserId))
            .ToList();

        return Ok(ToPagedResponse(
            new PagedResult<PostResponseDto>(mapped, posts.TotalCount),
            page,
            pageSize
        ));
    }


    [HttpPost]
    public IActionResult Create([FromBody] PostDto dto)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var attachmentDtos = dto.Attachments ?? new List<PostMediaDto>();

        var validAttachments = attachmentDtos
            .Where(a => !string.IsNullOrWhiteSpace(a.Url))
            .ToList();

        if (validAttachments.Count > 10)
        {
            return BadRequest("Максимум 10 вложений на пост.");
        }

        var attachments = validAttachments
            .Select(a => new PostMedia
            {
                Url = a.Url ?? string.Empty,
                MimeType = a.MimeType ?? string.Empty,
                SizeBytes = a.SizeBytes,
                Type = Enum.IsDefined(typeof(PostMediaType), a.Type) ? a.Type : PostMediaType.Other
            })
            .ToList();

        var contentType = DetermineContentType(dto.Content, attachments);

        var post = new Post
        {
            Title = dto.Title ?? string.Empty,
            Content = dto.Content ?? string.Empty,
            ContentType = contentType,
            Media = attachments,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _postService.CreatePost(post);
        return CreatedAtAction(nameof(GetById), new { id = post.Id }, ToResponse(post, userId));
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var post = _postService.GetPostById(id);
        if (post == null)
        {
            return NotFound();
        }

        if (post.UserId != currentUserId)
        {
            return StatusCode(403);
        }

        _postService.DeletePost(id);
        return NoContent();
    }

    private static PagedResponse<T> ToPagedResponse<T>(PagedResult<T> source, int page, int pageSize)
    {
        return new PagedResponse<T>(source.Items, source.TotalCount, page, pageSize);
    }

    private static (int Page, int PageSize) NormalizePagination(int page, int pageSize)
    {
        var normalizedPage = Math.Max(page, 1);
        var normalizedPageSize = Math.Clamp(pageSize, 1, MaxPageSize);

        return (normalizedPage, normalizedPageSize);
    }

    private bool TryGetUserId(out int userId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out userId);
    }

    private static PostResponseDto ToResponse(Post post, int? currentUserId)
    {
        var likeCount = post.Likes?.Count ?? 0;
        var commentCount = post.Comments?.Count ?? 0;
        var isLiked = currentUserId.HasValue &&
                      (post.Likes?.Any(l => l.UserId == currentUserId.Value) ?? false);

        var attachments = post.Media?.Select(m => new PostMediaDto
        {
            Id = m.Id,
            Url = m.Url,
            MimeType = m.MimeType,
            SizeBytes = m.SizeBytes,
            Type = m.Type
        }).ToList() ?? [];

        var fullName = post.User?.Profile?.FullName;

        return new PostResponseDto
        {
            Id = post.Id,
            Title = post.Title,
            Content = post.Content,
            ContentType = post.ContentType,
            CreatedAt = post.CreatedAt,
            UserId = post.UserId,
            Username = post.User?.Username ?? string.Empty,
            UserFullName = string.IsNullOrWhiteSpace(fullName) ? null : fullName,
            UserAvatar = post.User?.Profile?.ProfilePictureUrl,
            IsOwn = currentUserId.HasValue && post.UserId == currentUserId.Value,
            IsLikedByCurrentUser = isLiked,
            LikeCount = likeCount,
            CommentCount = commentCount,
            Attachments = attachments
        };
    }

    private static ContentType DetermineContentType(string content, IReadOnlyCollection<PostMedia> attachments)
    {
        var hasText = !string.IsNullOrWhiteSpace(content);
        var hasImages = attachments.Any(a => a.Type == PostMediaType.Image);
        var hasVideos = attachments.Any(a => a.Type == PostMediaType.Video);
        var hasAudio = attachments.Any(a => a.Type == PostMediaType.Audio);
        var hasOther = attachments.Any(a => a.Type == PostMediaType.Other);

        var mediaKinds = new[] { hasImages, hasVideos, hasAudio, hasOther }.Count(x => x);
        var isMixedMedia = mediaKinds > 1;

        if (hasText || isMixedMedia || hasOther)
        {
            return ContentType.Article;
        }

        if (hasImages)
        {
            return ContentType.Photo;
        }

        if (hasVideos)
        {
            return ContentType.Video;
        }

        if (hasAudio)
        {
            return ContentType.Music;
        }

        return ContentType.Article;
    }
}
