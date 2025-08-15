using BlogContent.Services;
using BlogContent.WPF.ViewModel;
using Microsoft.Extensions.DependencyInjection;
using System.Windows.Controls;
namespace BlogContent.WPF.Views;

public partial class ProfileSetupPage : Page
{
    public ProfileSetupPage()
    {
        InitializeComponent();

        UserService userService = App.ServiceProvider.GetRequiredService<UserService>();
        FileService fileService = App.ServiceProvider.GetRequiredService<FileService>();

        DataContext = new ProfileSetupViewModel(App.NavigationService, userService, fileService);
    }
}
