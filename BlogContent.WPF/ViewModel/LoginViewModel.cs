using BlogContent.Services;
using BlogContent.WPF.Services;
using BlogContent.WPF.Utilities;
using BlogContent.WPF.ViewModel.Base;
using System.Windows.Input;
using UserService = BlogContent.Services.UserService;

namespace BlogContent.WPF.ViewModel;

public class LoginViewModel : ViewModelBase
{
    private readonly NavigationService _navigationService;
    private readonly AuthService _authService;
    private readonly UserService _userService;
    private string _email;
    private string _password;
    private string _errorMessage;
    private bool _hasError;

    public string Email
    {
        get => _email;
        set => SetProperty(ref _email, value);
    }

    public string Password
    {
        get => _password;
        set => SetProperty(ref _password, value);
    }

    public string ErrorMessage
    {
        get => _errorMessage;
        set
        {
            SetProperty(ref _errorMessage, value);
            HasError = !string.IsNullOrEmpty(value);
        }
    }

    public bool HasError
    {
        get => _hasError;
        set => SetProperty(ref _hasError, value);
    }

    public ICommand LoginCommand { get; }
    public ICommand NavigateToRegisterCommand { get; }
    public ICommand NavigateToStartCommand { get; }

    public LoginViewModel(NavigationService navigationService, AuthService authService, UserService userService)
    {
        _navigationService = navigationService;
        _authService = authService;
        _userService = userService;

        LoginCommand = new RelayCommand(_ => Login(), _ => CanLogin());
        NavigateToRegisterCommand = new RelayCommand(_ => _navigationService.Navigate("Register"));
        NavigateToStartCommand = new RelayCommand(_ => _navigationService.Navigate("Start"));

        object registrationSuccess = _navigationService.GetParameter("RegistrationSuccess");
        if (registrationSuccess != null && (bool)registrationSuccess)
        {
            ErrorMessage = "Регистрация успешно завершена. Войдите, используя свои учетные данные.";
            _navigationService.SetParameter("RegistrationSuccess", null);
        }
    }

    private bool CanLogin() => !string.IsNullOrEmpty(Email) && !string.IsNullOrEmpty(Password);

    private void Login()
    {
        try
        {
            Core.Models.User? user = _authService.Login(Email, Password);
            if (user != null)
            {
                // Получаем полные данные пользователя по ID
                Core.Models.User fullUser = _userService.GetUserById(user.Id);

                _navigationService.CurrentUser = fullUser;
                _navigationService.SetParameter("ProfileUser", fullUser);

                // Навигация на главную страницу
                _navigationService.NavigateTo("Home", false);
            }
            else
            {
                ErrorMessage = "Неверный email или пароль";
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Ошибка при входе: {ex.Message}";
        }
    }
}
