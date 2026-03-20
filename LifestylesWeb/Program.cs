using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

#region SEGMENT A — Service Configuration
builder.Services.AddRazorPages(options =>
{
    options.Conventions.AddPageRoute("/PagesIndex", "");
    options.Conventions.AddPageRoute("/PagesIndex", "/Index");
    options.Conventions.AddPageRoute("/Focus/FocusIndex", "/Focus");
    options.Conventions.AddPageRoute("/Focus/FocusIndex", "/Focus/Index");
});
#endregion // SEGMENT A — Service Configuration

var app = builder.Build();

#region SEGMENT B — HTTP Pipeline
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthorization();
app.MapStaticAssets();
#endregion // SEGMENT B — HTTP Pipeline

#region SEGMENT C — Web App Manifest Endpoints
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
#endregion // SEGMENT C — Web App Manifest Endpoints

#region SEGMENT D — Endpoint Mapping
app.MapRazorPages()
   .WithStaticAssets();

app.Run();
#endregion // SEGMENT D — Endpoint Mapping