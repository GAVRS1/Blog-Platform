using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using Microsoft.EntityFrameworkCore;

namespace BlogContent.Data.Repositories;

public class ReportRepository(BlogContext context) : IReportRepository
{
    private readonly BlogContext _context = context;

    public IEnumerable<Report> GetReports() =>
        _context.Reports
            .Include(r => r.ReporterUser)
            .Include(r => r.TargetUser)
            .Include(r => r.Post)
            .Include(r => r.Comment)
            .Include(r => r.ModerationActions)
            .AsNoTracking()
            .OrderByDescending(r => r.CreatedAt)
            .ToList();

    public Report? GetReportById(int id) =>
        _context.Reports
            .Include(r => r.ReporterUser)
            .Include(r => r.TargetUser)
            .Include(r => r.Post)
            .Include(r => r.Comment)
            .Include(r => r.ModerationActions)
            .AsNoTracking()
            .FirstOrDefault(r => r.Id == id);

    public void CreateReport(Report report)
    {
        _context.Reports.Add(report);
        _context.SaveChanges();
    }

    public void UpdateReport(Report report)
    {
        _context.Reports.Update(report);
        _context.SaveChanges();
    }
}
