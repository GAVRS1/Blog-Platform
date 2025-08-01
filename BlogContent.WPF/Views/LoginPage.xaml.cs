using BlogContent.WPF.ViewModel;
using System.Windows.Controls;
namespace BlogContent.WPF.Views;

public partial class LoginPage : Page
{
    public LoginPage()
    {
        InitializeComponent();
        DataContext = App.Current.Resources["LoginViewModel"] as LoginViewModel;
    }
}
