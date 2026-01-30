using BlogContent.Core.Models;

namespace BlogContent.Core.Interfaces;

public interface IAppealRepository
{
    IEnumerable<Appeal> GetAppeals();
    Appeal? GetAppealById(int id);
    void CreateAppeal(Appeal appeal);
    void UpdateAppeal(Appeal appeal);
    void DeleteAppeal(int id);
}
