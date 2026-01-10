using BlogContent.Core.Enums;
using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using Microsoft.EntityFrameworkCore;

namespace BlogContent.Data.Repositories;

public class ModerationActionRepository(BlogContext context) : IModerationActionRepository
{
    private readonly BlogContext _context = context;

    public IEnumerable<ModerationAction> GetActions() =>
        _context.ModerationActions
            .Include(a => a.AdminUser)
            .Include(a => a.TargetUser)
            .Include(a => a.Report)
            .Include(a => a.Appeals)
            .AsNoTracking()
            .OrderByDescending(a => a.CreatedAt)
            .ToList();

    public ModerationAction? GetActionById(int id) =>
        _context.ModerationActions
            .Include(a => a.AdminUser)
            .Include(a => a.TargetUser)
            .Include(a => a.Report)
            .Include(a => a.Appeals)
            .AsNoTracking()
            .FirstOrDefault(a => a.Id == id);

    public ModerationAction? GetLatestActionForUser(int userId, ModerationActionType actionType) =>
        _context.ModerationActions
            .Include(a => a.AdminUser)
            .Include(a => a.TargetUser)
            .Include(a => a.Report)
            .Include(a => a.Appeals)
            .AsNoTracking()
            .Where(a => a.TargetUserId == userId && a.ActionType == actionType)
            .OrderByDescending(a => a.CreatedAt)
            .FirstOrDefault();

    public void CreateAction(ModerationAction action)
    {
        _context.ModerationActions.Add(action);
        _context.SaveChanges();
    }
}
