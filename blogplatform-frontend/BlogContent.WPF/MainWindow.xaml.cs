using BlogContent.WPF.Services;
using BlogContent.WPF.ViewModel;
using BlogContent.WPF.Views;
using System.Windows;

namespace BlogContent.WPF;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();

        NavigationService navigationService = App.NavigationService;

        navigationService.Configure("Start", typeof(StartPage));
        navigationService.Configure("Login", typeof(LoginPage));
        navigationService.Configure("Register", typeof(RegisterPage));
        navigationService.Configure("ProfileSetup", typeof(ProfileSetupPage));
        navigationService.Configure("Home", typeof(HomePage));
        navigationService.Configure("UserProfile", typeof(UserProfilePage));

        navigationService.Configure("UserPosts", typeof(UserPostsPage));
        navigationService.Configure("UserLikes", typeof(UserLikesPage));

        navigationService.Initialize(MainFrame);

        DataContext = new MainViewModel(navigationService);

        navigationService.Navigate("Start");
    }
}