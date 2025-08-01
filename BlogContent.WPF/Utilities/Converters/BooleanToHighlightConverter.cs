using System.Globalization;
using System.Windows.Data;
using System.Windows.Media;

namespace BlogContent.WPF.Utilities.Converters;

public class BooleanToHighlightConverter : IValueConverter
{
    public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
    {
        if (value is bool isActive && isActive)
            return new SolidColorBrush(Color.FromRgb(235, 237, 240)); 
        
        return new SolidColorBrush(Colors.Transparent);
    }

    public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture) => throw new NotImplementedException();
}
