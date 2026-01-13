using BlogContent.Core.Interfaces;
using BlogContent.WPF.Api;
using BlogContent.WPF.Services;
using BlogContent.WPF.ViewModel;
using BlogContent.WPF.Views;
using Microsoft.Extensions.Configuration;
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
            services.AddSingleton<NavigationService>(NavigationService);

            services.AddTransient<MediaPlayerControl>();
            services.AddTransient<AudioPlayerControl>();

            IConfiguration configuration = new ConfigurationBuilder()
                .SetBasePath(AppContext.BaseDirectory)
                .AddJsonFile("appsettings.json", optional: true)
                .Build();

            ApiClientOptions apiOptions = new ApiClientOptions
            {
                BaseUrl = configuration["Api:BaseUrl"] ?? string.Empty
            };

            services.AddSingleton(apiOptions);
            services.AddSingleton<ApiTokenStore>();
            HttpClient httpClient = new HttpClient();
            if (!string.IsNullOrWhiteSpace(apiOptions.BaseUrl))
            {
                httpClient.BaseAddress = new Uri(apiOptions.BaseUrl);
            }

            services.AddSingleton(httpClient);

            services.AddScoped<IAuthService, AuthApiClient>();
            services.AddScoped<IUserService, UsersApiClient>();
            services.AddScoped<IPostService, PostsApiClient>();
            services.AddScoped<ICommentService, CommentsApiClient>();
            services.AddScoped<ILikeService, LikesApiClient>();
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
            Current.Resources["LoginViewModel"] = new LoginViewModel(NavigationService, authService);
            Current.Resources["RegisterViewModel"] = new RegisterViewModel(NavigationService, authService);
            Current.Resources["ProfileSetupViewModel"] = new ProfileSetupViewModel(NavigationService, authService, fileService);

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
