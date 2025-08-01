using BlogContent.WPF.ViewModel;
using System.Windows.Controls;
namespace BlogContent.WPF.Views;

public partial class RegisterPage : Page
{
    public RegisterPage()
    {
        InitializeComponent();
        DataContext = App.Current.Resources["RegisterViewModel"] as RegisterViewModel;
    }
}
