using BlogContent.WPF.Services;
using Microsoft.Extensions.DependencyInjection;
using System.Globalization;
using System.Windows.Data;

namespace BlogContent.WPF.Utilities.Converters;

public class MediaUrlToAbsolutePathConverter : IValueConverter
{
    public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
    {
        if (value == null || string.IsNullOrEmpty(value.ToString()))
            return null;
        

        string mediaPath = value.ToString();

        // Если путь уже абсолютный, возвращаем его
        if (System.IO.Path.IsPathRooted(mediaPath))
            return mediaPath;
        
        try
        {
            // Получаем FileService
            FileService? fileService = App.ServiceProvider.GetService<FileService>();
            if (fileService != null)
            {
                string fullPath = fileService.GetFullPath(mediaPath);
                return fullPath;
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error converting path: {ex.Message}");
        }

        return null;
    }

    public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture) => throw new NotImplementedException();
}
