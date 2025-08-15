using BlogContent.Services;
using BlogContent.WPF.Services;
using BlogContent.WPF.Utilities;
using BlogContent.WPF.ViewModel.Base;
using System.Text.RegularExpressions;
using System.Windows.Input;

namespace BlogContent.WPF.ViewModel;

public class RegisterViewModel : ViewModelBase
{
    private readonly NavigationService _navigationService;
    private readonly AuthService _authService;

    private string _email;
    private string _password;
    private string _confirmPassword;
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

    public string ConfirmPassword
    {
        get => _confirmPassword;
        set => SetProperty(ref _confirmPassword, value);
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

    public ICommand NextStepCommand { get; }
    public ICommand NavigateToLoginCommand { get; }
    public ICommand NavigateToStartCommand { get; }

    public RegisterViewModel(NavigationService navigationService, AuthService authService)
    {
        _navigationService = navigationService;
        _authService = authService;

        NextStepCommand = new RelayCommand(_ => GoToNextStep(), _ => CanGoToNextStep());
        NavigateToLoginCommand = new RelayCommand(_ => _navigationService.Navigate("Login"));
        NavigateToStartCommand = new RelayCommand(_ => _navigationService.Navigate("Start"));
    }

    private bool CanGoToNextStep()
    {
        return !string.IsNullOrEmpty(Email) &&
               !string.IsNullOrEmpty(Password) &&
               !string.IsNullOrEmpty(ConfirmPassword);
    }

    private void GoToNextStep()
    {
        // Очистить предыдущие ошибки
        ErrorMessage = string.Empty;

        // Валидация электронной почты
        if (!IsValidEmail(Email))
        {
            ErrorMessage = "Пожалуйста, введите корректный адрес электронной почты";
            return;
        }

        // Проверка существования пользователя
        try
        {
            if (_authService.UserExists(Email))
            {
                ErrorMessage = "Пользователь с таким email уже существует";
                return;
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Ошибка проверки пользователя: {ex.Message}";
            return;
        }

        // Валидация пароля
        if (Password.Length < 6)
        {
            ErrorMessage = "Пароль должен содержать не менее 6 символов";
            return;
        }

        // Проверка совпадения паролей
        if (Password != ConfirmPassword)
        {
            ErrorMessage = "Пароли не совпадают";
            return;
        }

        try
        {
            // Сохраняем данные в статическом классе
            RegistrationData.Email = Email;
            RegistrationData.Password = Password;

            // Переходим к следующему шагу
            _navigationService.Navigate("ProfileSetup");
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Ошибка при подготовке данных регистрации: {ex.Message}";
        }
    }

    private bool IsValidEmail(string email)
    {
        // Простая проверка формата email
        string pattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
        return Regex.IsMatch(email, pattern);
    }
}
