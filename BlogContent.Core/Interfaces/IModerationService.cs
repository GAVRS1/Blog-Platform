using BlogContent.Core.Enums;
using BlogContent.Core.Models;

namespace BlogContent.Core.Interfaces;

public interface IModerationService
{
    IEnumerable<Report> GetReports();
    Report? GetReportById(int id);
    IEnumerable<ModerationAction> GetActions();
    IEnumerable<Appeal> GetAppeals();
    ModerationAction? GetLatestActionForUser(int userId, ModerationActionType actionType);
    Report CreateReport(Report report);
    void UpdateReport(Report report);
    void DeleteReport(int reportId);
    ModerationAction CreateAction(ModerationAction action);
    Appeal CreateAppeal(Appeal appeal);
    Appeal ResolveAppeal(int appealId, AppealStatus status, string? resolution);
    void DeleteAppeal(int appealId);
}
