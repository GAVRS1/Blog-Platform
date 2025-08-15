using BlogContent.WPF.Services;
using BlogContent.WPF.Utilities;
using BlogContent.WPF.ViewModel.Base;
using System.Windows.Input;

namespace BlogContent.WPF.ViewModel;

public class StartViewModel : ViewModelBase
{
    private readonly NavigationService _navigationService;

    public StartViewModel(NavigationService navigationService)
    {
        _navigationService = navigationService;
        NavigateToLoginCommand = new RelayCommand(_ => NavigateToLogin());
        NavigateToRegisterCommand = new RelayCommand(_ => NavigateToRegister());
    }

    public ICommand NavigateToLoginCommand { get; }
    public ICommand NavigateToRegisterCommand { get; }

    private void NavigateToLogin() => _navigationService.Navigate("Login");

    private void NavigateToRegister() => _navigationService.Navigate("Register");
}
