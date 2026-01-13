using BlogContent.Core.Interfaces;
using BlogContent.WPF.Services;
using BlogContent.WPF.Utilities;
using BlogContent.WPF.ViewModel.Base;
using System.Windows.Input;


namespace BlogContent.WPF.ViewModel;

public class LoginViewModel : ViewModelBase
{
    private readonly NavigationService _navigationService;
    private readonly IAuthService _authService;
    private string _email;
    private string _password;
    private string _errorMessage;
    private bool _hasError;
    private bool _isLoading;

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

    public bool IsLoading
    {
        get => _isLoading;
        set => SetProperty(ref _isLoading, value);
    }

    public ICommand LoginCommand { get; }
    public ICommand NavigateToRegisterCommand { get; }
    public ICommand NavigateToStartCommand { get; }

    public LoginViewModel(NavigationService navigationService, IAuthService authService)
    {
        _navigationService = navigationService;
        _authService = authService;

        LoginCommand = new RelayCommand(async _ => await LoginAsync(), _ => CanLogin());
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

    private async Task LoginAsync()
    {
        try
        {
            ErrorMessage = string.Empty;
            IsLoading = true;

            Core.Models.User? user = await Task.Run(() => _authService.Login(Email, Password));
            if (user != null)
            {
                _navigationService.CurrentUser = user;
                _navigationService.SetParameter("ProfileUser", user);

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
        finally
        {
            IsLoading = false;
        }
    }
}
