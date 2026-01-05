using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Http;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace BlogContent.WebAPI.Swagger;

/// <summary>
/// Adds multipart/form-data schema for endpoints receiving file uploads.
/// </summary>
public class FileUploadOperationFilter : IOperationFilter
{
    private const string FormMediaType = "multipart/form-data";

    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var hasFormFile = context.ApiDescription.ParameterDescriptions
            .Any(parameter => ContainsFormFile(parameter.Type));

        if (!hasFormFile)
        {
            return;
        }

        operation.RequestBody = new OpenApiRequestBody
        {
            Content =
            {
                [FormMediaType] = new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Type = "object",
                        Properties = new Dictionary<string, OpenApiSchema>
                        {
                            ["file"] = new OpenApiSchema
                            {
                                Type = "string",
                                Format = "binary",
                                Description = "Файл для загрузки"
                            },
                            ["type"] = new OpenApiSchema
                            {
                                Type = "string",
                                Description = "Тип файла: image, video, audio или file",
                                Example = new OpenApiString("image")
                            }
                        },
                        Required = new HashSet<string> { "file", "type" }
                    }
                }
            }
        };
    }

    private static bool ContainsFormFile(Type type, HashSet<Type>? visitedTypes = null)
    {
        visitedTypes ??= new HashSet<Type>();
        if (!visitedTypes.Add(type))
        {
            return false;
        }

        if (type == typeof(IFormFile) || typeof(IFormFile).IsAssignableFrom(type))
        {
            return true;
        }

        var underlyingType = Nullable.GetUnderlyingType(type) ?? type;
        if (underlyingType.IsArray)
        {
            return ContainsFormFile(underlyingType.GetElementType()!, visitedTypes);
        }

        if (underlyingType.IsGenericType &&
            underlyingType.GetInterfaces().Any(i =>
                i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IEnumerable<>)))
        {
            return ContainsFormFile(underlyingType.GetGenericArguments()[0], visitedTypes);
        }

        return underlyingType.GetProperties()
            .Any(property => ContainsFormFile(property.PropertyType, visitedTypes));
    }
}
