// ============================================================
// SECTION A — Food Item Model
// ============================================================

using System;

namespace LifestyleCore.Models
{
    public sealed class FoodItem
    {
        public long Id { get; set; }

        public string Name { get; set; } = "";

        public double KjPerServing { get; set; }

        public string ServingLabel { get; set; } = "";

        public double? KjPer100g { get; set; }

        public DateTimeOffset CreatedAtUtc { get; set; }

        public DateTimeOffset UpdatedAtUtc { get; set; }
    }
}