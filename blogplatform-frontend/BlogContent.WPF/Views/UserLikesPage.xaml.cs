using BlogContent.WPF.ViewModel;
using System.Windows;
using System.Windows.Controls;

namespace BlogContent.WPF.Views;

public partial class UserLikesPage : Page
{
    public UserLikesPage()
    {
        InitializeComponent();

        Func<UserLikesViewModel>? viewModelFactory = Application.Current.Resources["UserLikesViewModelFactory"] as Func<UserLikesViewModel>;
        DataContext = viewModelFactory?.Invoke();
    }
}
