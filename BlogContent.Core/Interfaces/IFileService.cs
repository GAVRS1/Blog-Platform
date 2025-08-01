using System.Drawing;

namespace BlogContent.Core.Interfaces;

public interface IFileService
{
    /// <param name="sourceFilePath">Путь к исходному файлу</param>
    /// <param name="fileType">Тип файла</param>
    /// <param name="userId">ID пользователя</param>
    string SaveFile(string sourceFilePath, string fileType, int? userId = null);

    /// <param name="filePath">Путь к файлу для удаления</param>
    void DeleteFile(string filePath);

    /// <param name="relativePath">Относительный путь к файлу</param>
    string GetFullPath(string relativePath);

    /// <param name="sourceFilePath">Путь к исходному файлу</param>
    /// <param name="size">Размер миниатюры</param>
    string CreateThumbnail(string sourceFilePath, Size size);

    /// <param name="filePath">Путь к файлу</param>
    bool FileExists(string filePath);
}
