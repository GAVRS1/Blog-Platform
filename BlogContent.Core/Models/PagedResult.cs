namespace BlogContent.Core.Models;

public record PagedResult<T>(IEnumerable<T> Items, int TotalCount, int Page = 1, int PageSize = 0)
{
    public int Total => TotalCount;
}
