using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using Microsoft.EntityFrameworkCore;

namespace BlogContent.Data.Repositories;

public class AppealRepository(BlogContext context) : IAppealRepository
{
    private readonly BlogContext _context = context;

    public IEnumerable<Appeal> GetAppeals() =>
        _context.Appeals
            .Include(a => a.User)
            .Include(a => a.ModerationAction)
                .ThenInclude(ma => ma.AdminUser)
            .AsNoTracking()
            .OrderByDescending(a => a.CreatedAt)
            .ToList();

    public Appeal? GetAppealById(int id) =>
        _context.Appeals
            .Include(a => a.User)
            .Include(a => a.ModerationAction)
                .ThenInclude(ma => ma.AdminUser)
            .FirstOrDefault(a => a.Id == id);

    public void CreateAppeal(Appeal appeal)
    {
        _context.Appeals.Add(appeal);
        _context.SaveChanges();
    }

    public void UpdateAppeal(Appeal appeal)
    {
        _context.Appeals.Update(appeal);
        _context.SaveChanges();
    }
}
