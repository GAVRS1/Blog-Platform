using System.Globalization;
using System.Windows.Data;
using System.Windows;

namespace BlogContent.WPF.Utilities.Converters;

public class NullOrEmptyToVisibilityConverter : IValueConverter
{
    public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
    {
        bool isEmpty = value == null || (value is string str && string.IsNullOrWhiteSpace(str));
        bool invert = parameter != null && parameter.ToString() == "invert";

        if (invert)
            return isEmpty ? Visibility.Collapsed : Visibility.Visible;
        else
            return isEmpty ? Visibility.Visible : Visibility.Collapsed;
        
    }

    public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture) => throw new NotImplementedException();
}
