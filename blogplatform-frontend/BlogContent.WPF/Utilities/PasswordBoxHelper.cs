using System.Windows.Controls;
using System.Windows;

namespace BlogContent.WPF.Utilities;

public static class PasswordBoxHelper
{
    public static readonly DependencyProperty BoundPasswordProperty =
        DependencyProperty.RegisterAttached("BoundPassword",
            typeof(string),
            typeof(PasswordBoxHelper),
            new PropertyMetadata(string.Empty, OnBoundPasswordChanged));

    public static string GetBoundPassword(DependencyObject d) => (string)d.GetValue(BoundPasswordProperty);

    public static void SetBoundPassword(DependencyObject d, string value) => d.SetValue(BoundPasswordProperty, value);

    private static void OnBoundPasswordChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
    {
        PasswordBox? box = d as PasswordBox;

        if (box == null)
            return;

        box.PasswordChanged -= PasswordChanged;

        string newPassword = (string)e.NewValue;

        if (!GetIsUpdating(box))
            box.Password = newPassword;

        box.PasswordChanged += PasswordChanged;
    }

    public static readonly DependencyProperty IsUpdatingProperty =
        DependencyProperty.RegisterAttached("IsUpdating",
            typeof(bool),
            typeof(PasswordBoxHelper),
            new PropertyMetadata(false));

    public static bool GetIsUpdating(DependencyObject d) => (bool)d.GetValue(IsUpdatingProperty);

    public static void SetIsUpdating(DependencyObject d, bool value) => d.SetValue(IsUpdatingProperty, value);

    private static void PasswordChanged(object sender, RoutedEventArgs e)
    {
        PasswordBox? box = sender as PasswordBox;

        if (box == null)
            return;

        SetIsUpdating(box, true);
        SetBoundPassword(box, box.Password);
        SetIsUpdating(box, false);
    }
}
