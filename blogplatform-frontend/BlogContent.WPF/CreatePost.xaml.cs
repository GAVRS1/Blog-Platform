using BlogContent.Core.Models;
using BlogContent.Services;
using BlogContent.WPF.ViewModel;
using Microsoft.Extensions.DependencyInjection;
using System.Windows;

namespace BlogContent.WPF;

public partial class CreatePost : Window
{
    public bool PostCreated { get; set; }

    public CreatePost(User currentUser )
    {

        InitializeComponent();

        PostService postService = App.ServiceProvider.GetRequiredService<PostService>();
        FileService fileService = App.ServiceProvider.GetRequiredService<FileService>();

        CreatePostViewModel viewModel = new CreatePostViewModel(postService, fileService, currentUser)
        {
            CloseAction = result => 
            {
                PostCreated = result;
                DialogResult = result;
                Close();
            }
        };
        
        DataContext = viewModel;
    }
}
