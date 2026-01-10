using BlogContent.Core.Enums;

namespace BlogContent.WebAPI.DTOs;

public class ResolveReportRequest
{
    public int ReportId { get; set; }
    public ReportStatus Status { get; set; }
}
