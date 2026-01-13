using BlogContent.Core.Interfaces;
using System.Drawing;
using System.Drawing.Drawing2D;
using Image = System.Drawing.Image;

namespace BlogContent.WPF.Services;

public class FileService : IFileService
{
    private readonly string _baseStoragePath;
    private readonly string _avatarsFolder;
    private readonly string _postsImagesFolder;
    private readonly string _postsVideosFolder;
    private readonly string _postsAudiosFolder;
    private readonly string _thumbnailsFolder;

    public FileService(string baseStoragePath = null)
    {
        _baseStoragePath = baseStoragePath ?? @"C:\Users\begin\source\repos\SaveContentPlatform";

        _avatarsFolder = Path.Combine(_baseStoragePath, "Avatars");
        _postsImagesFolder = Path.Combine(_baseStoragePath, "Posts", "Images");
        _postsVideosFolder = Path.Combine(_baseStoragePath, "Posts", "Videos");
        _postsAudiosFolder = Path.Combine(_baseStoragePath, "Posts", "Audios");
        _thumbnailsFolder = Path.Combine(_baseStoragePath, "Originals");

        EnsureDirectoriesExist();
    }

    private void EnsureDirectoriesExist()
    {
        Directory.CreateDirectory(_baseStoragePath);
        Directory.CreateDirectory(_avatarsFolder);
        Directory.CreateDirectory(_postsImagesFolder);
        Directory.CreateDirectory(_postsVideosFolder);
        Directory.CreateDirectory(_postsAudiosFolder);
        Directory.CreateDirectory(_thumbnailsFolder);
    }

    public string SaveFile(string sourceFilePath, string fileType, int? userId = null)
    {
        if (string.IsNullOrEmpty(sourceFilePath) || !File.Exists(sourceFilePath))
        {
            return string.Empty;
        }

        try
        {
            string targetDirectory = fileType.ToLower() switch
            {
                "avatar" => _avatarsFolder,
                "post_image" => _postsImagesFolder,
                "post_video" => _postsVideosFolder,
                "post_audio" => _postsAudiosFolder,
                _ => _baseStoragePath
            };

            string extension = Path.GetExtension(sourceFilePath);
            string uniqueFileName = $"{Guid.NewGuid()}{extension}";

            if (userId.HasValue)
            {
                uniqueFileName = $"user_{userId}_{uniqueFileName}";
            }

            string destinationPath = Path.Combine(targetDirectory, uniqueFileName);

            File.Copy(sourceFilePath, destinationPath, true);

            return GetRelativePath(destinationPath);
        }
        catch (Exception)
        {
            return string.Empty;
        }
    }

    public void DeleteFile(string filePath)
    {
        try
        {
            if (!string.IsNullOrEmpty(filePath) && FileExists(filePath))
            {
                string fullPath = GetFullPath(filePath);
                File.Delete(fullPath);
            }
        }
        catch (Exception)
        {
        }
    }

    public string GetFullPath(string relativePath)
    {
        if (string.IsNullOrEmpty(relativePath))
        {
            return string.Empty;
        }

        if (Path.IsPathRooted(relativePath) && relativePath.StartsWith(_baseStoragePath))
        {
            return relativePath;
        }

        return Path.Combine(_baseStoragePath, relativePath.TrimStart('/').TrimStart('\\'));
    }

    public string CreateThumbnail(string sourceFilePath, Size size)
    {
        if (string.IsNullOrEmpty(sourceFilePath) || !File.Exists(sourceFilePath))
        {
            return string.Empty;
        }
        try
        {
            using Image originalImage = Image.FromFile(sourceFilePath);

            Size thumbnailSize = CalculateAspectRatioSize(originalImage.Size, size);

            using Bitmap thumbnail = new Bitmap(thumbnailSize.Width, thumbnailSize.Height);

            using Graphics graphics = Graphics.FromImage(thumbnail);
            graphics.CompositingQuality = CompositingQuality.HighQuality;
            graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
            graphics.SmoothingMode = SmoothingMode.HighQuality;

            Rectangle rect = new Rectangle(0, 0, thumbnailSize.Width, thumbnailSize.Height);
            graphics.DrawImage(originalImage, rect);

            string fileName = Path.GetFileNameWithoutExtension(sourceFilePath);
            string extension = Path.GetExtension(sourceFilePath);
            string thumbFileName = $"{fileName}_thumb{extension}";
            string thumbPath = Path.Combine(_thumbnailsFolder, thumbFileName);

            thumbnail.Save(thumbPath, originalImage.RawFormat);

            return GetRelativePath(thumbPath);
        }
        catch (Exception)
        {
            return string.Empty;
        }
    }

    public bool FileExists(string filePath)
    {
        if (string.IsNullOrEmpty(filePath))
        {
            return false;
        }

        return File.Exists(GetFullPath(filePath));
    }

    private string GetRelativePath(string fullPath) => fullPath.Replace(_baseStoragePath, "").TrimStart('\\').TrimStart('/');

    private static Size CalculateAspectRatioSize(Size originalSize, Size targetSize)
    {
        float ratioWidth = (float)targetSize.Width / originalSize.Width;
        float ratioHeight = (float)targetSize.Height / originalSize.Height;
        float ratio = Math.Min(ratioWidth, ratioHeight);

        int newWidth = (int)(originalSize.Width * ratio);
        int newHeight = (int)(originalSize.Height * ratio);

        return new Size(newWidth, newHeight);
    }
}
