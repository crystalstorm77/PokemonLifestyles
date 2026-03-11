using LifestyleCore.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace LifestyleCore.Data
{
    public sealed class SleepRewardSummary
    {
        #region SECTION A — Sleep Reward Summary Fields
        public int TotalLoggedMinutes { get; set; }
        public int TotalLoggedSessionCount { get; set; }
        public int RewardEligibleSessionMinimumMinutes { get; set; } = 1;
        public int QualifyingSessionCount { get; set; }
        public int CountedSessionCount { get; set; }
        public int IgnoredQualifyingSessionCount { get; set; }
        public int MainSleepMinutes { get; set; }
        public int CatchUpMinutesAvailable { get; set; }
        public int CatchUpMinutesUsed { get; set; }
        public int RewardEligibleMinutes { get; set; }
        public double Multiplier { get; set; } = 1.0;
        public string Band { get; set; } = "no sleep logged";
        #endregion // SECTION A — Sleep Reward Summary Fields
    }

    public static class SleepRewardCalculator
    {
        #region SECTION B — Sleep Reward Calculations
        public const int MaxRewardEligibleSessionsPerGameDay = 3;
        private static readonly TimeSpan GameDayCutoffLocalTime = new(3, 0, 0);

        public static DateOnly GetGameDayForWakeLocal(DateTime localWakeTime)
        {
            var gameDay = DateOnly.FromDateTime(localWakeTime);

            if (localWakeTime.TimeOfDay < GameDayCutoffLocalTime)
                gameDay = gameDay.AddDays(-1);

            return gameDay;
        }

        public static SleepRewardSummary Calculate(
            IEnumerable<int>? sessionDurationsMinutesChronological,
            double healthyMinHours,
            double healthyMaxHours,
            double healthyMultiplier,
            double penaltyPer15Min,
            double unhealthyMinimumMultiplier,
            int rewardEligibleSessionMinimumMinutes)
        {
            double normalizedHealthyMinHours = Math.Max(0.0, healthyMinHours);
            double normalizedHealthyMaxHours = Math.Max(normalizedHealthyMinHours, healthyMaxHours);
            double normalizedHealthyMultiplier = Math.Max(1.0, healthyMultiplier);
            double normalizedPenaltyPer15Min = Math.Max(0.0, penaltyPer15Min);
            double normalizedUnhealthyMinimumMultiplier = Math.Max(1.0, unhealthyMinimumMultiplier);
            int normalizedRewardEligibleSessionMinimumMinutes = Math.Max(1, rewardEligibleSessionMinimumMinutes);

            if (normalizedUnhealthyMinimumMultiplier > normalizedHealthyMultiplier)
                normalizedUnhealthyMinimumMultiplier = normalizedHealthyMultiplier;

            var orderedDurations = (sessionDurationsMinutesChronological ?? Enumerable.Empty<int>())
                .Select(minutes => Math.Max(0, minutes))
                .ToList();

            var summary = new SleepRewardSummary
            {
                TotalLoggedMinutes = orderedDurations.Sum(),
                TotalLoggedSessionCount = orderedDurations.Count,
                RewardEligibleSessionMinimumMinutes = normalizedRewardEligibleSessionMinimumMinutes
            };

            var qualifyingDurations = orderedDurations
                .Where(minutes => minutes >= normalizedRewardEligibleSessionMinimumMinutes)
                .ToList();

            summary.QualifyingSessionCount = qualifyingDurations.Count;

            var countedDurations = qualifyingDurations
                .Take(MaxRewardEligibleSessionsPerGameDay)
                .ToList();

            summary.CountedSessionCount = countedDurations.Count;
            summary.IgnoredQualifyingSessionCount = Math.Max(0, qualifyingDurations.Count - countedDurations.Count);

            if (countedDurations.Count == 0)
            {
                summary.Multiplier = 1.0;
                summary.Band = summary.TotalLoggedMinutes > 0
                    ? $"below reward-eligibility minimum (<{normalizedRewardEligibleSessionMinimumMinutes}m)"
                    : "no sleep logged";
                return summary;
            }

            int mainIndex = 0;
            int mainSleepMinutes = countedDurations[0];

            for (int i = 1; i < countedDurations.Count; i++)
            {
                if (countedDurations[i] > mainSleepMinutes)
                {
                    mainSleepMinutes = countedDurations[i];
                    mainIndex = i;
                }
            }

            int catchUpAvailable = 0;
            for (int i = 0; i < countedDurations.Count; i++)
            {
                if (i == mainIndex)
                    continue;

                catchUpAvailable += countedDurations[i];
            }

            summary.MainSleepMinutes = mainSleepMinutes;
            summary.CatchUpMinutesAvailable = catchUpAvailable;

            double healthyMaxMinutes = normalizedHealthyMaxHours * 60.0;
            double effectiveMinutes = mainSleepMinutes;

            if (effectiveMinutes <= healthyMaxMinutes)
            {
                int catchUpUsed = (int)Math.Min(catchUpAvailable, Math.Max(0.0, healthyMaxMinutes - effectiveMinutes));
                summary.CatchUpMinutesUsed = catchUpUsed;
                effectiveMinutes += catchUpUsed;
            }

            summary.RewardEligibleMinutes = (int)Math.Round(effectiveMinutes, MidpointRounding.AwayFromZero);
            summary.Multiplier = ComputeMultiplier(
                effectiveMinutes,
                normalizedHealthyMinHours,
                normalizedHealthyMaxHours,
                normalizedHealthyMultiplier,
                normalizedPenaltyPer15Min,
                normalizedUnhealthyMinimumMultiplier);
            summary.Band = DescribeBand(
                mainSleepMinutes,
                summary.CatchUpMinutesUsed,
                effectiveMinutes,
                normalizedHealthyMinHours,
                normalizedHealthyMaxHours,
                normalizedRewardEligibleSessionMinimumMinutes,
                summary.TotalLoggedMinutes,
                summary.CountedSessionCount);

            return summary;
        }

        private static double ComputeMultiplier(
            double effectiveMinutes,
            double healthyMinHours,
            double healthyMaxHours,
            double healthyMultiplier,
            double penaltyPer15Min,
            double unhealthyMinimumMultiplier)
        {
            if (effectiveMinutes <= 0)
                return 1.0;

            double healthyMinMinutes = healthyMinHours * 60.0;
            double healthyMaxMinutes = healthyMaxHours * 60.0;

            if (effectiveMinutes >= healthyMinMinutes && effectiveMinutes <= healthyMaxMinutes)
                return healthyMultiplier;

            double distanceMinutes =
                effectiveMinutes < healthyMinMinutes
                    ? healthyMinMinutes - effectiveMinutes
                    : effectiveMinutes - healthyMaxMinutes;

            double multiplier = healthyMultiplier - ((distanceMinutes / 15.0) * penaltyPer15Min);

            if (multiplier < unhealthyMinimumMultiplier)
                multiplier = unhealthyMinimumMultiplier;

            if (multiplier > healthyMultiplier)
                multiplier = healthyMultiplier;

            return multiplier;
        }

        private static string DescribeBand(
            int mainSleepMinutes,
            int catchUpMinutesUsed,
            double effectiveMinutes,
            double healthyMinHours,
            double healthyMaxHours,
            int rewardEligibleSessionMinimumMinutes,
            int totalLoggedMinutes,
            int countedSessionCount)
        {
            if (countedSessionCount <= 0)
            {
                return totalLoggedMinutes > 0
                    ? $"below reward-eligibility minimum (<{rewardEligibleSessionMinimumMinutes}m)"
                    : "no sleep logged";
            }

            double healthyMinMinutes = healthyMinHours * 60.0;
            double healthyMaxMinutes = healthyMaxHours * 60.0;

            if (mainSleepMinutes > healthyMaxMinutes)
                return "above healthy range (main sleep)";

            if (effectiveMinutes < healthyMinMinutes)
                return "below healthy range";

            if (catchUpMinutesUsed > 0)
                return "healthy range (with catch-up sleep)";

            return "healthy range";
        }
        #endregion // SECTION B — Sleep Reward Calculations
    }
}