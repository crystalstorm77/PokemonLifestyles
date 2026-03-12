using LifestyleCore.Data;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace LifestylesWeb.Pages;

public class IndexModel : PageModel
{
    #region SECTION A — Page Load
    public string DataFilePath { get; private set; } = "";

    public void OnGet()
    {
        DataFilePath = Db.GetDbPath();
    }
    #endregion // SECTION A — Page Load
}