using BlogContent.WPF.ViewModel;
using System.Windows.Controls;
namespace BlogContent.WPF.Views;

public partial class StartPage : Page
{
    public StartPage()
    {
        InitializeComponent();
        DataContext = App.Current.Resources["StartViewModel"] as StartViewModel;
    }
}
