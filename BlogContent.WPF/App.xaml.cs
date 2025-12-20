using BlogContent.Core.Interfaces;
using BlogContent.Data;
using BlogContent.Data.Repositories;
using BlogContent.Services;
using BlogContent.WPF.Services;
using BlogContent.WPF.ViewModel;
using BlogContent.WPF.Views;
using Microsoft.Extensions.DependencyInjection;
using System.Windows;

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
            services.AddScoped<IPostRepository, PostRepository>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<ICommentRepository, CommentRepository>();
            services.AddScoped<ILikeRepository, LikeRepository>();

            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IPostService, PostService>();
            services.AddScoped<ICommentService, CommentService>();
            services.AddScoped<ILikeService, LikeService>();
            services.AddTransient<UserPostsViewModel>();
            services.AddTransient<UserLikesViewModel>();
            services.AddSingleton<FileService>(provider =>
                new FileService(@"C:\Users\begin\source\repos\SaveContentPlatform")); // поменять перед запуском
            services.AddSingleton<IFileService>(provider => provider.GetRequiredService<FileService>());
        }

        private void RegisterViewModels()
        {
            IUserService userService = ServiceProvider.GetRequiredService<IUserService>();
            IAuthService authService = ServiceProvider.GetRequiredService<IAuthService>();
            IPostService postService = ServiceProvider.GetRequiredService<IPostService>();
            ICommentService commentService = ServiceProvider.GetRequiredService<ICommentService>();
            ILikeService likeService = ServiceProvider.GetRequiredService<ILikeService>();
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
