using System.Windows.Media.Imaging;

namespace BlogContent.WPF.Utilities;

public static class MediaHelper
{
    /// <param name="imagePath">Путь к изображению</param>
    /// <param name="maxWidth">Максимальная ширина</param>
    /// <param name="maxHeight">Максимальная высота</param>
    /// <param name="defaultImagePath">Путь к изображению по умолчанию</param>
    public static BitmapImage LoadImage(string imagePath, int maxWidth = 0, int maxHeight = 0, string defaultImagePath = null)
    {
        try
        {
            if (string.IsNullOrEmpty(imagePath) || !System.IO.File.Exists(imagePath))
                return LoadDefaultImage(defaultImagePath);


            BitmapImage image = new BitmapImage();
            image.BeginInit();
            image.CacheOption = BitmapCacheOption.OnLoad;
            image.UriSource = new Uri(imagePath);

            if (maxWidth > 0)
                image.DecodePixelWidth = maxWidth;
            if (maxHeight > 0)
                image.DecodePixelHeight = maxHeight;

            image.EndInit();
            image.Freeze();

            return image;
        }
        catch (Exception ex)
        {
            return LoadDefaultImage(defaultImagePath);
        }
    }

    private static BitmapImage LoadDefaultImage(string defaultImagePath)
    {
        try
        {
            if (!string.IsNullOrEmpty(defaultImagePath))
            {
                BitmapImage defaultImage = new BitmapImage();
                defaultImage.BeginInit();
                defaultImage.UriSource = new Uri(defaultImagePath, UriKind.RelativeOrAbsolute);
                defaultImage.EndInit();
                return defaultImage;
            }

            // пустое изображение, если путь не указан
            return new BitmapImage();
        }
        catch
        {
            return new BitmapImage();
        }
    }

    public static string GetMediaPath(string relativePath, string baseStoragePath)
    {
        if (string.IsNullOrEmpty(relativePath))
            return string.Empty;

        if (System.IO.Path.IsPathRooted(relativePath))
            return relativePath;

        return System.IO.Path.Combine(baseStoragePath, relativePath.TrimStart('/').TrimStart('\\'));
    }
}
