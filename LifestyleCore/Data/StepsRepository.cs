#region SECTION A — Steps Repository
using System;
using System.Globalization;
using System.Threading.Tasks;
using Dapper;

namespace LifestyleCore.Data
{
    public sealed class StepsRepository
    {
        #region SECTION B — Public API
        public async Task<int> GetStepsForDateAsync(DateOnly date)
        {
            StepsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();
            string d = date.ToString("yyyy-MM-dd");

            long steps = await conn.ExecuteScalarAsync<long>(@"
SELECT COALESCE((
    SELECT Steps
    FROM StepsDaily
    WHERE Date = @Date
    LIMIT 1
), 0);", new { Date = d });

            return checked((int)steps);
        }

        public sealed class StepBucketViewRow
        {
            // Some UIs bind to "LocalTime", others to "BucketStartLocal".
            public string LocalTime { get; set; } = "";
            public string BucketStartLocal
            {
                get => LocalTime;
                set => LocalTime = value;
            }

            public int Steps { get; set; }
        }

        // Back-compat for StepsBucketsWindow.xaml.cs
        public Task<System.Collections.Generic.List<StepBucketViewRow>> GetBucketsForDateAsync(DateOnly date)
            => GetBucketsForLocalDateAsync(date);

        public async Task<System.Collections.Generic.List<StepBucketViewRow>> GetBucketsForLocalDateAsync(DateOnly localDate)
        {
            StepsSchema.EnsureCreated();

            using var conn = Db.OpenConnection();
            string d = localDate.ToString("yyyy-MM-dd");

            var rows = await conn.QueryAsync<(string BucketStartUtc, long Steps)>(@"
SELECT BucketStartUtc, Steps
FROM StepBuckets
WHERE BucketLocalDate = @Date
ORDER BY BucketStartUtc ASC;", new { Date = d });

            var list = new System.Collections.Generic.List<StepBucketViewRow>();

            foreach (var r in rows)
            {
                if (!DateTimeOffset.TryParse(r.BucketStartUtc, out var utc))
                    continue;

                var local = utc.ToLocalTime();

                list.Add(new StepBucketViewRow
                {
                    LocalTime = local.ToString("yyyy-MM-dd HH:mm"),
                    Steps = (int)r.Steps
                });
            }

            return list;
        }

        public async Task AddStepsAsync(DateTime localWhen, int deltaSteps, string source)
        {
            if (deltaSteps <= 0)
                throw new InvalidOperationException("deltaSteps must be > 0.");

            StepsSchema.EnsureCreated();

            // Convert the moment to UTC (robust around DST)
            var utcWhen = LocalToUtc(localWhen);

            // Daily date is local date
            var localDate = DateOnly.FromDateTime(localWhen).ToString("yyyy-MM-dd");

            // Bucket start is derived from the actual UTC sample, then floored in local time to 15 min.
            var bucketStartUtc = GetBucketStartUtcFromSampleUtc(utcWhen);
            var bucketLocalDate = DateOnly.FromDateTime(bucketStartUtc.ToLocalTime().DateTime).ToString("yyyy-MM-dd");

            string nowUtc = DateTimeOffset.UtcNow.ToString("O");

            using var conn = Db.OpenConnection();

            // StepsDaily: add delta
            await conn.ExecuteAsync(@"
INSERT INTO StepsDaily (Date, Steps, UpdatedAtUtc)
VALUES (@Date, @Steps, @UpdatedAtUtc)
ON CONFLICT(Date) DO UPDATE SET
    Steps = Steps + excluded.Steps,
    UpdatedAtUtc = excluded.UpdatedAtUtc;", new
            {
                Date = localDate,
                Steps = deltaSteps,
                UpdatedAtUtc = nowUtc
            });

            // StepBuckets: add delta
            await conn.ExecuteAsync(@"
INSERT INTO StepBuckets (BucketStartUtc, BucketLocalDate, Steps, UpdatedAtUtc)
VALUES (@BucketStartUtc, @BucketLocalDate, @Steps, @UpdatedAtUtc)
ON CONFLICT(BucketStartUtc) DO UPDATE SET
    Steps = Steps + excluded.Steps,
    BucketLocalDate = excluded.BucketLocalDate,
    UpdatedAtUtc = excluded.UpdatedAtUtc;", new
            {
                BucketStartUtc = bucketStartUtc.ToString("O"),
                BucketLocalDate = bucketLocalDate,
                Steps = deltaSteps,
                UpdatedAtUtc = nowUtc
            });

            _ = source;
        }
        #endregion // SECTION B — Public API

        #region SECTION D — View DTO
        public sealed class StepBucketView
        {
            public string LocalBucketStart { get; set; } = "";
            public int Steps { get; set; }
            public string UpdatedLocal { get; set; } = "";
        }
        #endregion // SECTION D — View DTO

        #region SECTION C — Time helpers
        private static DateTimeOffset LocalToUtc(DateTime localDateTime)
        {
            // Treat as local wall clock time.
            var tz = TimeZoneInfo.Local;
            var unspecified = DateTime.SpecifyKind(localDateTime, DateTimeKind.Unspecified);

            if (tz.IsInvalidTime(unspecified))
                throw new InvalidOperationException("That local time does not exist (daylight savings shift).");

            if (tz.IsAmbiguousTime(unspecified))
            {
                // Choose the *later* instant for ambiguous wall-clock times.
                // (Good default for “events that happened after the fall-back”.)
                var offsets = tz.GetAmbiguousTimeOffsets(unspecified);
                var chosen = offsets[0] < offsets[1] ? offsets[0] : offsets[1]; // smaller offset => later UTC instant
                return new DateTimeOffset(unspecified, chosen).ToUniversalTime();
            }

            var utc = TimeZoneInfo.ConvertTimeToUtc(unspecified, tz);
            return new DateTimeOffset(utc, TimeSpan.Zero);
        }

        private static DateTimeOffset GetBucketStartUtcFromSampleUtc(DateTimeOffset sampleUtc)
        {
            // Convert to local, floor to 15 minutes, then convert back.
            var local = sampleUtc.ToLocalTime().DateTime; // Kind=Unspecified
            int flooredMin = (local.Minute / 15) * 15;
            var bucketLocal = new DateTime(local.Year, local.Month, local.Day, local.Hour, flooredMin, 0);

            var tz = TimeZoneInfo.Local;
            var unspecified = DateTime.SpecifyKind(bucketLocal, DateTimeKind.Unspecified);

            if (tz.IsInvalidTime(unspecified))
            {
                // This shouldn't happen because bucketLocal derived from a valid local time,
                // but keep it safe.
                unspecified = unspecified.AddHours(1);
            }

            if (!tz.IsAmbiguousTime(unspecified))
            {
                var utc = TimeZoneInfo.ConvertTimeToUtc(unspecified, tz);
                return new DateTimeOffset(utc, TimeSpan.Zero);
            }

            // Ambiguous: choose the candidate bucket instant that is <= sampleUtc and closest.
            var offsets = tz.GetAmbiguousTimeOffsets(unspecified);
            DateTimeOffset? best = null;

            foreach (var off in offsets)
            {
                var cand = new DateTimeOffset(unspecified, off).ToUniversalTime();
                if (cand <= sampleUtc)
                {
                    if (best == null || cand > best.Value)
                        best = cand;
                }
            }

            // If both candidates are after sampleUtc (should be rare), pick the earlier.
            if (best != null)
                return best.Value;

            var c0 = new DateTimeOffset(unspecified, offsets[0]).ToUniversalTime();
            var c1 = new DateTimeOffset(unspecified, offsets[1]).ToUniversalTime();
            return c0 < c1 ? c0 : c1;
        }
        #endregion // SECTION C — Time helpers
    }
}
#endregion // SECTION A — Steps Repository