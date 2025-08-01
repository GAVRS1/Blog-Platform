using BlogContent.Core.Models;
using System.Windows.Controls;

namespace BlogContent.WPF.Services;

public class NavigationService
{
    private readonly Dictionary<string, Type> _pagesByKey = [];
    private readonly Dictionary<string, object> _parameters = new();
    private Frame? _frame;
    private User? _currentUser;

    public User? CurrentUser
    {
        get => _currentUser;
        set
        {
            _currentUser = value;
            SetParameter("CurrentUser", value);
        }
    }

    public void Configure(string key, Type pageType)
    {
        if (_pagesByKey.ContainsKey(key))
            _pagesByKey[key] = pageType;
        else
            _pagesByKey.Add(key, pageType);
    }

    public void Initialize(Frame frame)
    {
        _frame = frame;
    }

    public bool Navigate(string pageKey)
    {
        if (_frame == null)
            throw new InvalidOperationException("Navigation service is not initialized");
        

        if (!_pagesByKey.ContainsKey(pageKey))
            throw new ArgumentException($"No such page: {pageKey}");

        Type pageType = _pagesByKey[pageKey];

        Page? page = (Page)Activator.CreateInstance(pageType);

        return _frame.Navigate(page);
    }

    public bool NavigateTo(string pageKey, bool addToHistory = true)
    {
        if (_frame == null)
            throw new InvalidOperationException("Navigation service is not initialized");
        

        if (!_pagesByKey.ContainsKey(pageKey))
            throw new ArgumentException($"No such page: {pageKey}");
        

        Type pageType = _pagesByKey[pageKey];

        // Создаем страницу
        Page? page = (Page)Activator.CreateInstance(pageType);

        if (!addToHistory && _frame.CanGoBack)
            _frame.NavigationService.RemoveBackEntry();
        

        return _frame.Navigate(page);
    }

    public void SetParameter(string key, object value)
    {
        if (_parameters.ContainsKey(key))
            _parameters[key] = value;
        else
            _parameters.Add(key, value);
    }

    public object GetParameter(string key)
    {
        object? value = _parameters.ContainsKey(key) ? _parameters[key] : null;
        return value;
    }

    // Метод для проверки возможности навигации назад
    public bool CanGoBack()
    {
        return _frame != null && _frame.CanGoBack;
    }

    // Метод для навигации назад
    public void GoBack()
    {
        if (_frame != null && _frame.CanGoBack)
            _frame.GoBack();
        
    }

    public void DumpParameters()
    {
        System.Diagnostics.Debug.WriteLine("NavigationService: Current parameters:");
        foreach (var param in _parameters)
            System.Diagnostics.Debug.WriteLine($"  {param.Key} = {param.Value}");
        
    }
}