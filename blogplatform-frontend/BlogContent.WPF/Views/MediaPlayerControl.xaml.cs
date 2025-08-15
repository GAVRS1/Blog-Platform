
using System.Windows;
using System.Windows.Controls;
using System.Windows.Threading;

namespace BlogContent.WPF.Views;

public partial class MediaPlayerControl : UserControl
{
    private DispatcherTimer _timer;
    private bool _isPlaying = false;
    private bool _isDragging = false;
    private string _mediaSource;

    public static readonly DependencyProperty MediaSourceProperty =
        DependencyProperty.Register("MediaSource", typeof(string), typeof(MediaPlayerControl),
            new PropertyMetadata(null, OnMediaSourceChanged));

    public string MediaSource
    {
        get { return (string)GetValue(MediaSourceProperty); }
        set { SetValue(MediaSourceProperty, value); }
    }

    public MediaPlayerControl()
    {
        InitializeComponent();

        _timer = new DispatcherTimer();
        _timer.Interval = TimeSpan.FromMilliseconds(500);
        _timer.Tick += Timer_Tick;
    }

    private static void OnMediaSourceChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
    {
        var control = (MediaPlayerControl)d;
        control.OnMediaSourceChanged((string)e.NewValue);
    }

    private void OnMediaSourceChanged(string newSource)
    {
        _mediaSource = newSource;

        if (!string.IsNullOrEmpty(_mediaSource))
        {
            try
            {
                MediaPlayer.Source = new Uri(_mediaSource);
                MediaPlayer.Stop();
                _isPlaying = false;
                UpdatePlayButton();
            }
            catch (Exception)
            {
            }
        }
    }

    private void MediaPlayer_MediaOpened(object sender, RoutedEventArgs e)
    {
        ProgressSlider.Minimum = 0;
        ProgressSlider.Maximum = MediaPlayer.NaturalDuration.TimeSpan.TotalSeconds;
        ProgressSlider.Value = 0;

        UpdateTimeDisplay();
        _timer.Start();
    }

    private void MediaPlayer_MediaEnded(object sender, RoutedEventArgs e)
    {
        MediaPlayer.Stop();
        MediaPlayer.Position = TimeSpan.Zero;
        _isPlaying = false;
        UpdatePlayButton();
    }

    private void MediaPlayer_MediaFailed(object sender, ExceptionRoutedEventArgs e)
    {
        System.Diagnostics.Debug.WriteLine($"Media failed: {e.ErrorException.Message}");
    }

    private void PlayButton_Click(object sender, RoutedEventArgs e)
    {
        if (_isPlaying)
        {
            MediaPlayer.Pause();
            _isPlaying = false;
        }
        else
        {
            MediaPlayer.Play();
            _isPlaying = true;
        }

        UpdatePlayButton();
    }

    private void ProgressSlider_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
    {
        if (_isDragging)
        {
            MediaPlayer.Position = TimeSpan.FromSeconds(e.NewValue);
            UpdateTimeDisplay();
        }
    }

    private void ProgressSlider_PreviewMouseDown(object sender, System.Windows.Input.MouseButtonEventArgs e) => _isDragging = true;

    private void ProgressSlider_PreviewMouseUp(object sender, System.Windows.Input.MouseButtonEventArgs e)
    {
        if (_isDragging)
        {
            MediaPlayer.Position = TimeSpan.FromSeconds(ProgressSlider.Value);
            _isDragging = false;
        }
    }

    private void Timer_Tick(object sender, EventArgs e)
    {
        if (!_isDragging && MediaPlayer.NaturalDuration.HasTimeSpan)
        {
            ProgressSlider.Value = MediaPlayer.Position.TotalSeconds;
            UpdateTimeDisplay();
        }
    }

    private void UpdateTimeDisplay()
    {
        if (MediaPlayer.NaturalDuration.HasTimeSpan)
            TimeDisplay.Text = $"{FormatTimeSpan(MediaPlayer.Position)} / {FormatTimeSpan(MediaPlayer.NaturalDuration.TimeSpan)}";
    }

    private string FormatTimeSpan(TimeSpan time)
    {
        if (time.Hours > 0)
            return $"{time.Hours}:{time.Minutes:D2}:{time.Seconds:D2}";
        else
            return $"{time.Minutes}:{time.Seconds:D2}";
    }

    private void UpdatePlayButton() => PlayButton.Content = _isPlaying ? "Stop" : "Play";

    public void Play()
    {
        MediaPlayer.Play();
        _isPlaying = true;
        UpdatePlayButton();
    }

    public void Pause()
    {
        MediaPlayer.Pause();
        _isPlaying = false;
        UpdatePlayButton();
    }

    public void Stop()
    {
        MediaPlayer.Stop();
        _isPlaying = false;
        UpdatePlayButton();
    }
}
