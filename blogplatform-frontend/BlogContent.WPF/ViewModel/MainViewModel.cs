using BlogContent.WPF.Services;
using BlogContent.WPF.ViewModel.Base;

namespace BlogContent.WPF.ViewModel;

public class MainViewModel : ViewModelBase
{
    private readonly NavigationService _navigationService;

    public MainViewModel(NavigationService navigationService) => _navigationService = navigationService;
}
