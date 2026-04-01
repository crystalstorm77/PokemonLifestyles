using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

#region SEGMENT A â€” Service Configuration
builder.Services.AddRazorPages(options =>
{
    options.Conventions.AddPageRoute("/PagesIndex", "");
    options.Conventions.AddPageRoute("/PagesIndex", "/Index");
    options.Conventions.AddPageRoute("/Focus/FocusIndex", "/Focus");
    options.Conventions.AddPageRoute("/Focus/FocusIndex", "/Focus/Index");
});
#endregion // SEGMENT A â€” Service Configuration

var app = builder.Build();

#region SEGMENT B â€” HTTP Pipeline
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthorization();
app.MapStaticAssets();
#endregion // SEGMENT B â€” HTTP Pipeline

#region SEGMENT C â€” Web App Manifest Endpoints
static IResult BuildManifestResponse(
    string id,
    string name,
    string shortName,
    string description,
    string startUrl)
{
    var manifest = new
    {
        id,
        name,
        short_name = shortName,
        description,
        start_url = startUrl,
        scope = "/",
        display = "standalone",
        background_color = "#020617",
        theme_color = "#d9e8fb",
        orientation = "portrait",
        icons = new[]
        {
            new
            {
                src = "/favicon.ico",
                sizes = "48x48 32x32 16x16",
                type = "image/x-icon",
                purpose = "any"
            }
        }
    };

    return Results.Text(
        JsonSerializer.Serialize(manifest),
        "application/manifest+json; charset=utf-8");
}

app.MapGet(
    "/manifest.json",
    () => BuildManifestResponse(
        id: "/",
        name: "Pokemon Lifestyles",
        shortName: "Lifestyles",
        description: "Pokemon Lifestyles web-first mobile app.",
        startUrl: "/?source=pwa-home"));

app.MapGet(
    "/standalone-probe-manifest.json",
    () => BuildManifestResponse(
        id: "/standalone-probe",
        name: "Pokemon Lifestyles Probe",
        shortName: "PL Probe",
        description: "Pokemon Lifestyles standalone viewport probe.",
        startUrl: "/standalone-probe?source=pwa-home"));
#endregion // SEGMENT C â€” Web App Manifest Endpoints

#region SEGMENT C2 â€” Offline Asset Manifest Endpoint
static string ToRootRelativeWebPath(string webRootPath, string filePath)
{
    string relativePath = Path.GetRelativePath(webRootPath, filePath)
        .Replace('\\', '/');

    return relativePath.StartsWith("/")
        ? relativePath
        : "/" + relativePath;
}

static IResult BuildOfflineAssetManifestResponse(string webRootPath)
{
    string[] fixedAssetPaths =
    {
        "/",
        "/manifest.json",
        "/favicon.ico",
        "/css/site.css",
        "/css/art-skin.css",
        "/css/focus-canvas.css",
        "/js/pl-pwa-boot.js",
        "/js/pl-home-stage.js",
        "/js/pl-viewport-debug.js",
        "/js/pl-home-canvas.js",
        "/js/pl-offline-store.js",
        "/lib/bootstrap/dist/css/bootstrap.min.css",
        "/lib/bootstrap/dist/js/bootstrap.bundle.min.js"
    };

    string assetsRoot = Path.Combine(webRootPath, "assets");
    IEnumerable<string> discoveredAssetPaths = Directory.Exists(assetsRoot)
        ? Directory.EnumerateFiles(assetsRoot, "*", SearchOption.AllDirectories)
            .Select(filePath => ToRootRelativeWebPath(webRootPath, filePath))
        : Enumerable.Empty<string>();

    string[] allAssetPaths = fixedAssetPaths
        .Concat(discoveredAssetPaths)
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .OrderBy(path => path, StringComparer.OrdinalIgnoreCase)
        .ToArray();

    return Results.Json(new
    {
        version = "v2",
        assets = allAssetPaths
    });
}

app.MapGet(
    "/offline-asset-manifest.json",
    () => BuildOfflineAssetManifestResponse(app.Environment.WebRootPath));
#endregion // SEGMENT C2 â€” Offline Asset Manifest Endpoint

#region SEGMENT D â€” Endpoint Mapping
app.MapRazorPages()
   .WithStaticAssets();

app.Run();
#endregion // SEGMENT D â€” Endpoint Mapping
