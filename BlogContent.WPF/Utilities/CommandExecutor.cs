using System.Windows.Input;

namespace BlogContent.WPF.Utilities;

public static class CommandExecutor
{
    public static void Execute(ICommand command, object parameter = null)
    {
        if (command?.CanExecute(parameter) ?? false)
            command.Execute(parameter);
    }
}
