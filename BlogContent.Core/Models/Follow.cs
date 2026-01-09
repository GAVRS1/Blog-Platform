using System;

namespace BlogContent.Core.Models;

public class Follow
{
    public int Id { get; set; }
    public int FollowerUserId { get; set; }
    public User? FollowerUser { get; set; }
    public int TargetUserId { get; set; }
    public User? TargetUser { get; set; }
    public DateTime CreatedAt { get; set; }
}
