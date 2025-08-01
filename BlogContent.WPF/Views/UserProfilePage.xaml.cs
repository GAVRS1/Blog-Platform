using BlogContent.WPF.ViewModel;
using System.Windows;
using System.Windows.Controls;
namespace BlogContent.WPF.Views;

public partial class UserProfilePage : Page
{
    public UserProfilePage()
    {
        InitializeComponent();

        Func<UserProfileViewModel>? viewModelFactory = Application.Current.Resources["UserProfileViewModelFactory"] as Func<UserProfileViewModel>;
        DataContext = viewModelFactory?.Invoke();
    }
}
