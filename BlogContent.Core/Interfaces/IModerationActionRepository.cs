using BlogContent.Core.Models;

namespace BlogContent.Core.Interfaces;

public interface IModerationActionRepository
{
    IEnumerable<ModerationAction> GetActions();
    ModerationAction? GetActionById(int id);
    void CreateAction(ModerationAction action);
}
