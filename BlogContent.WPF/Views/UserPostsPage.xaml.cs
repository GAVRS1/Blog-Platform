using BlogContent.WPF.ViewModel;
using System.Windows;
using System.Windows.Controls;
namespace BlogContent.WPF.Views;

public partial class UserPostsPage : Page
{
    public UserPostsPage()
    {
        InitializeComponent();

        Func<UserPostsViewModel>? viewModelFactory = Application.Current.Resources["UserPostsViewModelFactory"] as Func<UserPostsViewModel>;
        DataContext = viewModelFactory?.Invoke();
    }
}