using System;
using BlogContent.Core.Enums;
using BlogContent.Core.Models;

namespace BlogContent.WebAPI.DTOs;

public class UserResponseDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool EmailConfirmed { get; set; }
    public UserStatus Status { get; set; }
    public UserProfileDto? Profile { get; set; }
}

public class UserProfileDto
{
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateOnly? BirthDate { get; set; }
    public int Age { get; set; }
    public string Bio { get; set; } = string.Empty;
    public string ProfilePictureUrl { get; set; } = string.Empty;
}

public static class UserMappingExtensions
{
    public static UserResponseDto ToDto(this User user)
    {
        if (user == null)
        {
            throw new ArgumentNullException(nameof(user));
        }

        return new UserResponseDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            EmailConfirmed = user.EmailConfirmed,
            Status = user.Status,
            Profile = user.Profile == null
                ? null
                : new UserProfileDto
                {
                    Username = user.Profile.Username,
                    FullName = user.Profile.FullName,
                    BirthDate = user.Profile.BirthDate == default ? null : user.Profile.BirthDate,
                    Age = user.Profile.Age,
                    Bio = user.Profile.Bio,
                    ProfilePictureUrl = user.Profile.ProfilePictureUrl
                }
        };
    }
}
