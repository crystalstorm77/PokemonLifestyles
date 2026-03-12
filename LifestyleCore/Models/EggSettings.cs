namespace LifestyleCore.Models
{
    public sealed class EggSettings
    {
        #region SECTION A — Columns
        public int CommonStepsRequired { get; set; } = 10000;
        public int UncommonStepsRequired { get; set; } = 20000;
        public int RareStepsRequired { get; set; } = 30000;
        #endregion // SECTION A — Columns
    }
}