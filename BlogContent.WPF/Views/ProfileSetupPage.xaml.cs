using BlogContent.Core.Interfaces;
using BlogContent.WPF.Api;
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
        MediaApiClient mediaApiClient = App.ServiceProvider.GetRequiredService<MediaApiClient>();

        DataContext = new ProfileSetupViewModel(App.NavigationService, authService, mediaApiClient);
    }
}
