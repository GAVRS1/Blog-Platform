using System.Windows;
using System.Windows.Controls;
namespace BlogContent.WPF.Views;

public partial class SharedLayout : UserControl
{
    public static readonly DependencyProperty PageContentProperty =
        DependencyProperty.RegisterAttached(
            "PageContent",
            typeof(object),
            typeof(SharedLayout),
            new PropertyMetadata(null));

    public static object GetPageContent(DependencyObject obj) => obj.GetValue(PageContentProperty);

    public static void SetPageContent(DependencyObject obj, object value) => obj.SetValue(PageContentProperty, value);

    public SharedLayout() => InitializeComponent();
}
