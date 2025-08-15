namespace BlogContent.Core.Exceptions;

public class UserNotFoundException(string message) : Exception(message)
{
}

public class PostNotFoundException(string message) : Exception(message)
{
}

public class CommentNotFoundException(string message) : Exception(message)
{
}

public class LikeAlreadyExistsException(string message) : Exception(message)
{
}

