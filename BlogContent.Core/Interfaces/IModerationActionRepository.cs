using BlogContent.Core.Enums;
using BlogContent.Core.Models;

namespace BlogContent.Core.Interfaces;

public interface IModerationActionRepository
{
    IEnumerable<ModerationAction> GetActions();
    ModerationAction? GetActionById(int id);
    ModerationAction? GetLatestActionForUser(int userId, ModerationActionType actionType);
    void CreateAction(ModerationAction action);
}
