namespace BlogContent.Core.Enums
{
    public enum UserStatus
    {
        PendingEmailConfirmation, // Ожидает подтверждения почты
        Active,     // Обычный пользователь
        Banned,     // Заблокированный пользователь
        Admin       // Администратор
    }
}
