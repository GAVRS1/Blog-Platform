using System.Globalization;
using System.Windows.Data;
using System.Windows.Media.Imaging;

namespace BlogContent.WPF.Utilities.Converters;

public class NullImageConverter : IValueConverter
{
    public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
    {
        if (value == null || string.IsNullOrEmpty(value.ToString()))
            return new BitmapImage(new Uri("\\Assets\\Images\\default_avatar.png", UriKind.Relative));
        
        return value;
    }

    public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture) => throw new NotImplementedException();
}
