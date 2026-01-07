using BlogContent.Core.Enums;

namespace BlogContent.Services;

public static class SettingsAccessChecker
{
    public static bool CanAccess(Audience audience, bool areFriends)
    {
        return audience switch
        {
            Audience.Everyone => true,
            Audience.FriendsOnly => areFriends,
            Audience.NoOne => false,
            _ => false
        };
    }
}
