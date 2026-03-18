using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace LifestylesWeb.Pages;

[IgnoreAntiforgeryToken]
public sealed class LayoutSyncModel : PageModel
{
    #region SEGMENT A — Layout Storage Paths
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true
    };

    private static string LayoutFolderPath =>
        Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments),
            "Pokemon Lifestyles");

    private static string LayoutFilePath =>
        Path.Combine(LayoutFolderPath, "layout-overrides.json");
    #endregion // SEGMENT A — Layout Storage Paths

    #region SEGMENT B — JSON Handlers
    public IActionResult OnGetRead()
    {
        var payload = LoadPayload();
        return new JsonResult(payload, JsonOptions);
    }

    public async Task<IActionResult> OnPostWriteAsync()
    {
        using var reader = new StreamReader(Request.Body);
        var raw = await reader.ReadToEndAsync();

        LayoutOverridesPayload payload;

        try
        {
            payload = string.IsNullOrWhiteSpace(raw)
                ? new LayoutOverridesPayload()
                : JsonSerializer.Deserialize<LayoutOverridesPayload>(raw, JsonOptions)
                  ?? new LayoutOverridesPayload();
        }
        catch (JsonException)
        {
            return BadRequest(new { ok = false, error = "Invalid layout payload." });
        }

        Directory.CreateDirectory(LayoutFolderPath);
        await System.IO.File.WriteAllTextAsync(
            LayoutFilePath,
            JsonSerializer.Serialize(payload, JsonOptions));

        return new JsonResult(new { ok = true, itemCount = payload.Items.Count }, JsonOptions);
    }

    private static LayoutOverridesPayload LoadPayload()
    {
        try
        {
            if (!System.IO.File.Exists(LayoutFilePath))
            {
                return new LayoutOverridesPayload();
            }

            var raw = System.IO.File.ReadAllText(LayoutFilePath);

            return string.IsNullOrWhiteSpace(raw)
                ? new LayoutOverridesPayload()
                : JsonSerializer.Deserialize<LayoutOverridesPayload>(raw, JsonOptions)
                  ?? new LayoutOverridesPayload();
        }
        catch
        {
            return new LayoutOverridesPayload();
        }
    }
    #endregion // SEGMENT B — JSON Handlers
}

public sealed class LayoutOverridesPayload
{
    #region SEGMENT C — Layout Override Collection

    public Dictionary<string, LayoutAssetOverride> Items { get; set; } =
        new(StringComparer.OrdinalIgnoreCase);

    public Dictionary<string, string> Variables { get; set; } =
        new(StringComparer.OrdinalIgnoreCase);

    #endregion // SEGMENT C — Layout Override Collection
}

public sealed class LayoutAssetOverride
{
    #region SEGMENT D — Layout Override Values
    public int? X { get; set; }
    public int? Y { get; set; }
    public int? Width { get; set; }
    public int? Height { get; set; }
    public int? Scale { get; set; }
    #endregion // SEGMENT D — Layout Override Values
}