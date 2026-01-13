using BlogContent.Core.Interfaces;
using BlogContent.WPF.Services;
using BlogContent.WPF.Utilities;
using BlogContent.WPF.ViewModel.Base;
using System.Text.RegularExpressions;
using System.Windows.Input;

namespace BlogContent.WPF.ViewModel;

public class RegisterViewModel : ViewModelBase
{
    private readonly NavigationService _navigationService;
    private readonly IAuthService _authService;

    private string _email;
    private string _password;
    private string _confirmPassword;
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

    public bool IsLoading
    {
        get => _isLoading;
        set => SetProperty(ref _isLoading, value);
    }

    public ICommand NextStepCommand { get; }
    public ICommand NavigateToLoginCommand { get; }
    public ICommand NavigateToStartCommand { get; }

    public RegisterViewModel(NavigationService navigationService, IAuthService authService)
    {
        _navigationService = navigationService;
        _authService = authService;

        NextStepCommand = new RelayCommand(async _ => await GoToNextStepAsync(), _ => CanGoToNextStep());
        NavigateToLoginCommand = new RelayCommand(_ => _navigationService.Navigate("Login"));
        NavigateToStartCommand = new RelayCommand(_ => _navigationService.Navigate("Start"));
    }

    private bool CanGoToNextStep()
    {
        return !string.IsNullOrEmpty(Email) &&
               !string.IsNullOrEmpty(Password) &&
               !string.IsNullOrEmpty(ConfirmPassword);
    }

    private async Task GoToNextStepAsync()
    {
        // Очистить предыдущие ошибки
        ErrorMessage = string.Empty;
        IsLoading = true;

        // Валидация электронной почты
        if (!IsValidEmail(Email))
        {
            ErrorMessage = "Пожалуйста, введите корректный адрес электронной почты";
            IsLoading = false;
            return;
        }

        // Проверка существования пользователя
        try
        {
            bool userExists = await Task.Run(() => _authService.UserExists(Email));
            if (userExists)
            {
                ErrorMessage = "Пользователь с таким email уже существует";
                IsLoading = false;
                return;
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Ошибка проверки пользователя: {ex.Message}";
            IsLoading = false;
            return;
        }

        // Валидация пароля
        if (Password.Length < 6)
        {
            ErrorMessage = "Пароль должен содержать не менее 6 символов";
            IsLoading = false;
            return;
        }

        // Проверка совпадения паролей
        if (Password != ConfirmPassword)
        {
            ErrorMessage = "Пароли не совпадают";
            IsLoading = false;
            return;
        }

        try
        {
            Guid temporaryKey = await _authService.StartRegistrationAsync(Email);
            if (temporaryKey == Guid.Empty)
            {
                ErrorMessage = "Не удалось начать регистрацию. Проверьте данные.";
                return;
            }

            // Сохраняем данные в статическом классе
            RegistrationData.Email = Email;
            RegistrationData.Password = Password;
            RegistrationData.TemporaryKey = temporaryKey;

            // Переходим к следующему шагу
            _navigationService.Navigate("ProfileSetup");
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Ошибка при подготовке данных регистрации: {ex.Message}";
        }
        finally
        {
            IsLoading = false;
        }
    }

    private bool IsValidEmail(string email)
    {
        // Простая проверка формата email
        string pattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
        return Regex.IsMatch(email, pattern);
    }
}
