using BlogContent.Core.Enums;

namespace BlogContent.WebAPI.DTOs;

public class ResolveAppealRequest
{
    public int AppealId { get; set; }
    public AppealStatus Status { get; set; }
    public string? Resolution { get; set; }
}
