using BlogContent.Core.Enums;
using BlogContent.Core.Models;

namespace BlogContent.Core.Interfaces;

public interface IModerationService
{
    IEnumerable<Report> GetReports();
    Report? GetReportById(int id);
    IEnumerable<ModerationAction> GetActions();
    IEnumerable<Appeal> GetAppeals();
    Report CreateReport(Report report);
    void UpdateReport(Report report);
    ModerationAction CreateAction(ModerationAction action);
    Appeal ResolveAppeal(int appealId, AppealStatus status, string? resolution);
}
