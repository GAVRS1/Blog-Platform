using BlogContent.Core.Interfaces;
using BlogContent.WPF.Services;
using BlogContent.WPF.Utilities;
using BlogContent.WPF.ViewModel.Base;
using Microsoft.Win32;
using System.IO;
using System.Windows.Input;
using System.Windows.Media.Imaging;

namespace BlogContent.WPF.ViewModel;

public class ProfileSetupViewModel : ViewModelBase
{
    private readonly NavigationService _navigationService;
    private readonly IAuthService _authService;
    private readonly IFileService _fileService;

    private string _registerEmail;
    private string _registerPassword;
    private string _username;
    private string _fullName;
    private DateTime? _birthDate;
    private string _bio;
    private string _profilePictureUrl;
    private BitmapImage _profilePictureSource;
    private bool _hasProfilePicture;
    private string _errorMessage;
    private bool _hasError;
    private bool _isLoading;
    private string _verificationCode;

    public string Username
    {
        get => _username;
        set => SetProperty(ref _username, value);
    }

    public string FullName
    {
        get => _fullName;
        set => SetProperty(ref _fullName, value);
    }

    public DateTime? BirthDate
    {
        get => _birthDate;
        set => SetProperty(ref _birthDate, value);
    }

    public string Bio
    {
        get => _bio;
        set => SetProperty(ref _bio, value);
    }

    public string ProfilePictureUrl
    {
        get => _profilePictureUrl;
        set
        {
            SetProperty(ref _profilePictureUrl, value);
            HasProfilePicture = !string.IsNullOrEmpty(value);

            if (!string.IsNullOrEmpty(value) && File.Exists(value))
            {
                try
                {
                    BitmapImage image = new BitmapImage();
                    image.BeginInit();
                    image.CacheOption = BitmapCacheOption.OnLoad;
                    image.UriSource = new Uri(value);
                    image.EndInit();
                    ProfilePictureSource = image;
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Ошибка при загрузке изображения: {ex.Message}");
                    HasProfilePicture = false;
                }
            }
        }
    }

    public BitmapImage ProfilePictureSource
    {
        get => _profilePictureSource;
        set => SetProperty(ref _profilePictureSource, value);
    }

    public bool HasProfilePicture
    {
        get => _hasProfilePicture;
        set => SetProperty(ref _hasProfilePicture, value);
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

    public string VerificationCode
    {
        get => _verificationCode;
        set => SetProperty(ref _verificationCode, value);
    }

    public ICommand BrowseImageCommand { get; }
    public ICommand BackCommand { get; }
    public ICommand CompleteRegistrationCommand { get; }

    public ProfileSetupViewModel(NavigationService navigationService, IAuthService authService, IFileService fileService)
    {
        _navigationService = navigationService;
        _authService = authService;
        _fileService = fileService;

        // Получаем данные из статического класса
        _registerEmail = RegistrationData.Email;
        _registerPassword = RegistrationData.Password;

        BrowseImageCommand = new RelayCommand(_ => BrowseImage());
        BackCommand = new RelayCommand(_ => _navigationService.Navigate("Register"));
        CompleteRegistrationCommand = new RelayCommand(async _ => await CompleteRegistrationAsync(), _ => CanCompleteRegistration());

        // Установим текущую дату по умолчанию (с ограничением на минимальный возраст 12 лет)
        BirthDate = DateTime.Now.AddYears(-12);
    }

    private bool CanCompleteRegistration() => !string.IsNullOrEmpty(Username) && !string.IsNullOrEmpty(FullName) && BirthDate.HasValue;

    private void BrowseImage()
    {
        OpenFileDialog openFileDialog = new OpenFileDialog
        {
            Filter = "Изображения|*.jpg;*.jpeg;*.png;*.gif|Все файлы|*.*",
            Title = "Выберите изображение для профиля"
        };

        if (openFileDialog.ShowDialog() == true)
            ProfilePictureUrl = openFileDialog.FileName;
        
    }

    private async Task CompleteRegistrationAsync()
    {
        ErrorMessage = string.Empty;
        IsLoading = true;

        // Проверяем наличие данных первого этапа
        if (string.IsNullOrEmpty(_registerEmail) || string.IsNullOrEmpty(_registerPassword))
        {
            ErrorMessage = "Данные регистрации недоступны. Пожалуйста, начните регистрацию заново.";
            IsLoading = false;
            return;
        }

        if (RegistrationData.TemporaryKey == null)
        {
            ErrorMessage = "Сессия подтверждения не найдена. Пожалуйста, повторите регистрацию.";
            IsLoading = false;
            return;
        }

        // Валидация данных профиля
        if (string.IsNullOrEmpty(Username))
        {
            ErrorMessage = "Пожалуйста, введите ник";
            IsLoading = false;
            return;
        }

        if (string.IsNullOrEmpty(FullName))
        {
            ErrorMessage = "Пожалуйста, введите ФИО";
            IsLoading = false;
            return;
        }

        if (!BirthDate.HasValue)
        {
            ErrorMessage = "Пожалуйста, выберите дату рождения";
            IsLoading = false;
            return;
        }

        // Проверка возраста (минимальный возраст - 12 лет)
        DateTime minBirthDate = DateTime.Now.AddYears(-12);
        if (BirthDate > minBirthDate)
        {
            ErrorMessage = "Для регистрации вам должно быть не менее 12 лет";
            IsLoading = false;
            return;
        }

        if (string.IsNullOrWhiteSpace(VerificationCode))
        {
            ErrorMessage = "Введите код подтверждения из письма.";
            IsLoading = false;
            return;
        }

        try
        {
            string profileImagePath = CopyProfilePicture();

            await _authService.VerifyRegistrationAsync(RegistrationData.TemporaryKey.Value, VerificationCode);

            await _authService.CompleteRegistrationAsync(
                RegistrationData.TemporaryKey.Value,
                _registerPassword,
                Username,
                FullName,
                BirthDate,
                Bio,
                profileImagePath);

            RegistrationData.Email = null;
            RegistrationData.Password = null;
            RegistrationData.TemporaryKey = null;

            _navigationService.SetParameter("RegistrationSuccess", true);
            _navigationService.Navigate("Login");
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Ошибка при регистрации: {ex.Message}";
        }
        finally
        {
            IsLoading = false;
        }
    }

    private string CopyProfilePicture()
    {
        if (string.IsNullOrEmpty(ProfilePictureUrl) || !File.Exists(ProfilePictureUrl))
            return string.Empty;

        try
        {
            string relativePath = _fileService.SaveFile(ProfilePictureUrl, "avatar");

            _fileService.CreateThumbnail(ProfilePictureUrl, new System.Drawing.Size(150, 150));

            return relativePath;
        }
        catch (Exception)
        {
            return string.Empty;
        }
    }
}
