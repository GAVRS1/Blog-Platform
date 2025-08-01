using System.Windows;
using System.Windows.Controls;
using System.Windows.Threading;

namespace BlogContent.WPF.Views;

public partial class AudioPlayerControl : UserControl
{
    private DispatcherTimer _timer;
    private bool _isPlaying = false;
    private bool _isDragging = false;
    private string _audioSource;

    public static readonly DependencyProperty AudioSourceProperty =
        DependencyProperty.Register("AudioSource", typeof(string), typeof(AudioPlayerControl),
            new PropertyMetadata(null, OnAudioSourceChanged));

    public string AudioSource
    {
        get { return (string)GetValue(AudioSourceProperty); }
        set { SetValue(AudioSourceProperty, value); }
    }

    public AudioPlayerControl()
    {
        InitializeComponent();

        _timer = new DispatcherTimer();
        _timer.Interval = TimeSpan.FromMilliseconds(500);
        _timer.Tick += Timer_Tick;
    }

    private static void OnAudioSourceChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
    {
        AudioPlayerControl control = (AudioPlayerControl)d;
        control.OnAudioSourceChanged((string)e.NewValue);
    }

    private void OnAudioSourceChanged(string newSource)
    {
        _audioSource = newSource;

        if (!string.IsNullOrEmpty(_audioSource))
        {
            try
            {
                AudioPlayer.Source = new Uri(_audioSource);
                AudioPlayer.Stop();
                _isPlaying = false;
                UpdatePlayButton();
            }
            catch (Exception)
            {
            }
        }
    }

    private void AudioPlayer_MediaOpened(object sender, RoutedEventArgs e)
    {
        ProgressSlider.Minimum = 0;
        ProgressSlider.Maximum = AudioPlayer.NaturalDuration.TimeSpan.TotalSeconds;
        ProgressSlider.Value = 0;

        UpdateTimeDisplay();
        _timer.Start();
    }

    private void AudioPlayer_MediaEnded(object sender, RoutedEventArgs e)
    {
        AudioPlayer.Stop();
        AudioPlayer.Position = TimeSpan.Zero;
        _isPlaying = false;
        UpdatePlayButton();
    }

    private void AudioPlayer_MediaFailed(object sender, ExceptionRoutedEventArgs e)
    {
    }

    private void PlayButton_Click(object sender, RoutedEventArgs e)
    {
        if (_isPlaying)
        {
            AudioPlayer.Pause();
            _isPlaying = false;
        }
        else
        {
            AudioPlayer.Play();
            _isPlaying = true;
        }

        UpdatePlayButton();
    }

    private void ProgressSlider_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
    {
        if (_isDragging)
        {
            AudioPlayer.Position = TimeSpan.FromSeconds(e.NewValue);
            UpdateTimeDisplay();
        }
    }

    private void ProgressSlider_PreviewMouseDown(object sender, System.Windows.Input.MouseButtonEventArgs e) => _isDragging = true;

    private void ProgressSlider_PreviewMouseUp(object sender, System.Windows.Input.MouseButtonEventArgs e)
    {
        if (_isDragging)
        {
            AudioPlayer.Position = TimeSpan.FromSeconds(ProgressSlider.Value);
            _isDragging = false;
        }
    }

    private void Timer_Tick(object sender, EventArgs e)
    {
        if (!_isDragging && AudioPlayer.NaturalDuration.HasTimeSpan)
        {
            ProgressSlider.Value = AudioPlayer.Position.TotalSeconds;
            UpdateTimeDisplay();
        }
    }

    private void UpdateTimeDisplay()
    {
        if (AudioPlayer.NaturalDuration.HasTimeSpan)
            TimeDisplay.Text = $"{FormatTimeSpan(AudioPlayer.Position)} / {FormatTimeSpan(AudioPlayer.NaturalDuration.TimeSpan)}";
        
    }

    private string FormatTimeSpan(TimeSpan time)
    {
        if (time.Hours > 0)
            return $"{time.Hours}:{time.Minutes:D2}:{time.Seconds:D2}";
        else
            return $"{time.Minutes}:{time.Seconds:D2}";
    }

    private void UpdatePlayButton() => PlayButton.Content = _isPlaying ? "Stop" : "Go";

    public void Play()
    {
        AudioPlayer.Play();
        _isPlaying = true;
        UpdatePlayButton();
    }

    public void Pause()
    {
        AudioPlayer.Pause();
        _isPlaying = false;
        UpdatePlayButton();
    }

    public void Stop()
    {
        AudioPlayer.Stop();
        _isPlaying = false;
        UpdatePlayButton();
    }
}
