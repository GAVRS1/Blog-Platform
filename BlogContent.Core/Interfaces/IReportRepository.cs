using BlogContent.Core.Models;

namespace BlogContent.Core.Interfaces;

public interface IReportRepository
{
    IEnumerable<Report> GetReports();
    Report? GetReportById(int id);
    void CreateReport(Report report);
    void UpdateReport(Report report);
}
