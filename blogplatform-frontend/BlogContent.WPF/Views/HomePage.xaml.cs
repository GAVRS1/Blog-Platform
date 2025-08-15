using BlogContent.WPF.ViewModel;
using System.Windows;
using System.Windows.Controls;
namespace BlogContent.WPF.Views;

public partial class HomePage : Page
{
    public HomePage()
    {
        InitializeComponent();

        Func<HomeViewModel>? viewModelFactory = Application.Current.Resources["HomeViewModelFactory"] as Func<HomeViewModel>;
        DataContext = viewModelFactory?.Invoke();
    }
}
