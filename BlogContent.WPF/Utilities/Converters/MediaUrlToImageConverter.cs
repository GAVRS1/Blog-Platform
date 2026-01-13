using BlogContent.WPF.Services;
using Microsoft.Extensions.DependencyInjection;
using System.Globalization;
using System.Windows.Data;
using System.Windows.Media.Imaging;
namespace BlogContent.WPF.Utilities.Converters;

public class MediaUrlToImageConverter : IValueConverter
{
    public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
    {
        try
        {
            // Если путь пустой или null, возвращаем изображение по умолчанию
            if (value == null || string.IsNullOrEmpty(value.ToString()))
            {
                string defaultImage = "\\Assets\\Images\\default_avatar.png";
                if (parameter != null && parameter.ToString().ToLower() == "post_image")
                    defaultImage = "\\Assets\\Images\\default_avatar.png";

                return new BitmapImage(new Uri(defaultImage, UriKind.Relative));
            }

            string imagePath = value.ToString();

            if (imagePath.StartsWith("/Assets/", StringComparison.OrdinalIgnoreCase)
                || imagePath.StartsWith("\\Assets\\", StringComparison.OrdinalIgnoreCase))
            {
                return new BitmapImage(new Uri(imagePath, UriKind.Relative));
            }

            MediaUrlResolver? urlResolver = App.ServiceProvider.GetService<MediaUrlResolver>();
            string resolvedUrl = urlResolver?.ToAbsoluteUrl(imagePath) ?? imagePath;

            BitmapImage image = new BitmapImage();
            image.BeginInit();
            image.CreateOptions = BitmapCreateOptions.IgnoreImageCache;
            image.CacheOption = BitmapCacheOption.OnLoad;
            image.UriSource = new Uri(resolvedUrl, UriKind.RelativeOrAbsolute);
            image.EndInit();
            image.Freeze();
            return image;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading image: {ex.Message}");

            // В случае ошибки возвращаем изображение по умолчанию
            string defaultImg = "\\Assets\\Images\\default_avatar.png";
            if (parameter != null && parameter.ToString().ToLower() == "post_image")
                defaultImg = "\\Assets\\Images\\default_avatar.png";

            return new BitmapImage(new Uri(defaultImg, UriKind.Relative));
        }
    }

    public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture) => throw new NotImplementedException();
}
