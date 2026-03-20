using System.Linq;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Hosting;

namespace LifestylesWeb.Pages;

[IgnoreAntiforgeryToken]
public sealed class LayoutSyncModel : PageModel
{
    #region SEGMENT A — Layout Storage Paths
    private readonly IWebHostEnvironment webHostEnvironment;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true
    };

    public LayoutSyncModel(IWebHostEnvironment webHostEnvironment)
    {
        this.webHostEnvironment = webHostEnvironment;
    }

    private static string LayoutFolderPath =>
        Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments),
            "Pokemon Lifestyles");

    private static string LayoutFilePath =>
        Path.Combine(LayoutFolderPath, "layout-overrides.json");

    private string LayoutArtFolderPath =>
        Path.Combine(
            webHostEnvironment.WebRootPath,
            "assets",
            "layout-editor");
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

    public async Task<IActionResult> OnPostUploadArtAsync(IFormFile? file, string? assetKey)
    {
        if (file is null || file.Length <= 0)
        {
            return BadRequest(new { ok = false, error = "No PNG file was provided." });
        }

        if (!string.Equals(Path.GetExtension(file.FileName), ".png", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { ok = false, error = "Only PNG files are supported." });
        }

        var safeAssetKey = SanitizePathSegment(assetKey, "asset");
        var safeFileName = SanitizeFileName(Path.GetFileName(file.FileName));

        if (string.IsNullOrWhiteSpace(safeFileName))
        {
            safeFileName = "asset.png";
        }

        var assetFolderPath = Path.Combine(LayoutArtFolderPath, safeAssetKey);
        Directory.CreateDirectory(assetFolderPath);

        var savedFilePath = Path.Combine(assetFolderPath, safeFileName);

        await using (var stream = System.IO.File.Create(savedFilePath))
        {
            await file.CopyToAsync(stream);
        }

        return new JsonResult(new
        {
            ok = true,
            path = $"/assets/layout-editor/{safeAssetKey}/{safeFileName}".Replace("\\", "/")
        }, JsonOptions);
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

    private static string SanitizePathSegment(string? value, string fallbackValue)
    {
        var raw = string.IsNullOrWhiteSpace(value) ? fallbackValue : value.Trim();
        var cleanedChars = raw
            .Select(ch => char.IsLetterOrDigit(ch) || ch == '-' || ch == '_' ? ch : '-')
            .ToArray();
        var cleaned = new string(cleanedChars).Trim('-');

        return string.IsNullOrWhiteSpace(cleaned) ? fallbackValue : cleaned;
    }

    private static string SanitizeFileName(string? fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
        {
            return string.Empty;
        }

        var invalidChars = Path.GetInvalidFileNameChars();
        var cleanedChars = fileName
            .Trim()
            .Select(ch => invalidChars.Contains(ch) ? '_' : ch)
            .ToArray();

        return new string(cleanedChars);
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

    public Dictionary<string, LayoutAssetOverride> DefaultItems { get; set; } =
        new(StringComparer.OrdinalIgnoreCase);

    public Dictionary<string, string> DefaultVariables { get; set; } =
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

    public Dictionary<string, LayoutComponentOverride> Components { get; set; } =
        new(StringComparer.OrdinalIgnoreCase);

    public Dictionary<string, string> Text { get; set; } =
        new(StringComparer.OrdinalIgnoreCase);
    #endregion // SEGMENT D — Layout Override Values
}

public sealed class LayoutComponentOverride
{
    #region SEGMENT E — Layout Component Override Values
    public int? X { get; set; }
    public int? Y { get; set; }
    public int? Width { get; set; }
    public int? Height { get; set; }
    public int? Scale { get; set; }

    public int? HitScale { get; set; }
    public int? HitScaleX { get; set; }
    public int? HitScaleY { get; set; }
    #endregion // SEGMENT E — Layout Component Override Values
}
