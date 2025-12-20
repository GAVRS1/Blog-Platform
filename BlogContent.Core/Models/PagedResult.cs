namespace BlogContent.Core.Models;

public record PagedResult<T>(IEnumerable<T> Items, int TotalCount);
