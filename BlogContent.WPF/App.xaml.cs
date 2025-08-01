using BlogContent.Data;
using BlogContent.Services;
using BlogContent.WPF.Services;
using BlogContent.WPF.ViewModel;
using BlogContent.WPF.Views;
using Microsoft.Extensions.DependencyInjection;
using System.Windows;
using System.Windows.Controls;

namespace BlogContent.WPF
{
    public partial class App : Application
    {
        public static NavigationService NavigationService { get; } = new NavigationService();
        public static ServiceProvider ServiceProvider { get; private set; }

        protected override void OnStartup(StartupEventArgs e)
        {
            try
            {
                base.OnStartup(e);

                using (BlogContext context = new BlogContext())
                {
                    context.Database.EnsureCreated();
                }

                ServiceCollection services = new ServiceCollection();
                ConfigureServices(services);
                ServiceProvider = services.BuildServiceProvider();

                RegisterViewModels();

                // Запуск главного окна
                MainWindow mainWindow = new MainWindow();
                mainWindow.Show();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Ошибка при запуске приложения: {ex.Message}\n\n{ex.StackTrace}",
                              "Критическая ошибка",
                              MessageBoxButton.OK,
                              MessageBoxImage.Error);
            }
        }

        private void ConfigureServices(ServiceCollection services)
        {
            services.AddScoped<BlogContext>();

            services.AddSingleton<NavigationService>(NavigationService);

            services.AddTransient<MediaPlayerControl>();
            services.AddTransient<AudioPlayerControl>();
            services.AddScoped<AuthService>();
            services.AddScoped<UserService>();
            services.AddScoped<PostService>();
            services.AddScoped<CommentService>();
            services.AddScoped<LikeService>();
            services.AddTransient<UserPostsViewModel>();
            services.AddTransient<UserLikesViewModel>();
            services.AddSingleton<FileService>(provider =>
                new FileService(@"C:\Users\begin\source\repos\SaveContentPlatform")); // поменять перед запуском
        }

        private void RegisterViewModels()
        {
            UserService userService = ServiceProvider.GetRequiredService<UserService>();
            AuthService authService = ServiceProvider.GetRequiredService<AuthService>();
            PostService postService = ServiceProvider.GetRequiredService<PostService>();
            CommentService commentService = ServiceProvider.GetRequiredService<CommentService>();
            LikeService likeService = ServiceProvider.GetRequiredService<LikeService>();
            FileService fileService = ServiceProvider.GetRequiredService<FileService>();

            Current.Resources["StartViewModel"] = new StartViewModel(NavigationService);
            Current.Resources["LoginViewModel"] = new LoginViewModel(NavigationService, authService, userService);
            Current.Resources["RegisterViewModel"] = new RegisterViewModel(NavigationService, authService);
            Current.Resources["ProfileSetupViewModel"] = new ProfileSetupViewModel(NavigationService, userService, fileService);

            Current.Resources["HomeViewModelFactory"] = new Func<HomeViewModel>(() =>
                new HomeViewModel(NavigationService, userService, postService, commentService, likeService, fileService));

            Current.Resources["UserProfileViewModelFactory"] = new Func<UserProfileViewModel>(() =>
                new UserProfileViewModel(NavigationService, userService, postService, commentService, likeService, fileService));

            Current.Resources["UserPostsViewModelFactory"] = new Func<UserPostsViewModel>(() =>
                new UserPostsViewModel(NavigationService, userService, postService, commentService, likeService, fileService));

            Current.Resources["UserLikesViewModelFactory"] = new Func<UserLikesViewModel>(() =>
                new UserLikesViewModel(NavigationService, userService, postService, commentService, likeService, fileService));
        }
    }
}
