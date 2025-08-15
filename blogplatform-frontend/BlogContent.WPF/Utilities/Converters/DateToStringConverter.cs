using System.Globalization;
using System.Windows.Data;

namespace BlogContent.WPF.Utilities.Converters;

public class DateToStringConverter : IValueConverter
{
    public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
    {
        if (value is DateTime dateTime)
        {
            // Если дата сегодняшняя - показываем только время
            if (dateTime.Date == DateTime.Today)
                return $"Сегодня в {dateTime.ToString("HH:mm")}";
            

            // Если дата вчерашняя - показываем "Вчера"
            if (dateTime.Date == DateTime.Today.AddDays(-1))
            
                return $"Вчера в {dateTime.ToString("HH:mm")}";
            

            // Если дата в пределах недели - показываем день недели
            if (dateTime > DateTime.Today.AddDays(-7))
            {
                string dayOfWeek = CultureInfo.GetCultureInfo("ru-RU").DateTimeFormat.GetDayName(dateTime.DayOfWeek);
                return $"{dayOfWeek} в {dateTime.ToString("HH:mm")}";
            }

            // Иначе показываем полную дату
            return dateTime.ToString("dd MMMM yyyy в HH:mm", CultureInfo.GetCultureInfo("ru-RU"));
        }
        return string.Empty;
    }

    public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture) => throw new NotImplementedException();
}
