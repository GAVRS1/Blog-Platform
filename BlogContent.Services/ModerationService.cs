using BlogContent.Core.Enums;
using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;

namespace BlogContent.Services;

public class ModerationService : IModerationService
{
    private readonly IReportRepository _reportRepository;
    private readonly IModerationActionRepository _actionRepository;
    private readonly IAppealRepository _appealRepository;

    public ModerationService(
        IReportRepository reportRepository,
        IModerationActionRepository actionRepository,
        IAppealRepository appealRepository)
    {
        _reportRepository = reportRepository;
        _actionRepository = actionRepository;
        _appealRepository = appealRepository;
    }

    public IEnumerable<Report> GetReports() => _reportRepository.GetReports();

    public Report? GetReportById(int id) => _reportRepository.GetReportById(id);

    public IEnumerable<ModerationAction> GetActions() => _actionRepository.GetActions();

    public IEnumerable<Appeal> GetAppeals() => _appealRepository.GetAppeals();

    public ModerationAction? GetLatestActionForUser(int userId, ModerationActionType actionType) =>
        _actionRepository.GetLatestActionForUser(userId, actionType);

    public Report CreateReport(Report report)
    {
        _reportRepository.CreateReport(report);
        return report;
    }

    public void UpdateReport(Report report)
    {
        _reportRepository.UpdateReport(report);
    }

    public void DeleteReport(int reportId)
    {
        _reportRepository.DeleteReport(reportId);
    }

    public ModerationAction CreateAction(ModerationAction action)
    {
        _actionRepository.CreateAction(action);
        return action;
    }

    public Appeal CreateAppeal(Appeal appeal)
    {
        _appealRepository.CreateAppeal(appeal);
        return appeal;
    }

    public Appeal ResolveAppeal(int appealId, AppealStatus status, string? resolution)
    {
        var appeal = _appealRepository.GetAppealById(appealId)
            ?? throw new InvalidOperationException("Апелляция не найдена.");

        appeal.Status = status;
        appeal.Resolution = resolution;
        appeal.ResolvedAt = DateTime.UtcNow;
        _appealRepository.UpdateAppeal(appeal);
        return appeal;
    }

    public void DeleteAppeal(int appealId)
    {
        _appealRepository.DeleteAppeal(appealId);
    }
}
