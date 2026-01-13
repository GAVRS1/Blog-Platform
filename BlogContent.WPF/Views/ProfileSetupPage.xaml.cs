using BlogContent.Core.Interfaces;
using BlogContent.WPF.Services;
using BlogContent.WPF.ViewModel;
using Microsoft.Extensions.DependencyInjection;
using System.Windows.Controls;
namespace BlogContent.WPF.Views;

public partial class ProfileSetupPage : Page
{
    public ProfileSetupPage()
    {
        InitializeComponent();

        IAuthService authService = App.ServiceProvider.GetRequiredService<IAuthService>();
        FileService fileService = App.ServiceProvider.GetRequiredService<FileService>();

        DataContext = new ProfileSetupViewModel(App.NavigationService, authService, fileService);
    }
}
