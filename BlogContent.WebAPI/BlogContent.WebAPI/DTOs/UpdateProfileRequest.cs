using System;

namespace BlogContent.WebAPI.DTOs;

public class UpdateProfileRequest
{
    public string? FullName { get; set; }
    public string? Bio { get; set; }
    public DateOnly? BirthDate { get; set; }
    public string? ProfilePictureUrl { get; set; }
}
