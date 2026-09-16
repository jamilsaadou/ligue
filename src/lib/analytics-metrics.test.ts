import assert from "node:assert/strict";
import test from "node:test";
import {
  analyticsPeriod,
  buildAnalyticsTimeline,
  percent,
  variation,
} from "./analytics-metrics";

test("calendar range contains today and the comparison has exactly the same duration", () => {
  const now = new Date("2026-09-16T13:42:00Z");
  const { from, to, previousFrom } = analyticsPeriod(7, now);
  assert.equal(from.toISOString(), "2026-09-10T00:00:00.000Z");
  assert.equal(
    to.getTime() - from.getTime(),
    from.getTime() - previousFrom.getTime(),
  );
  assert.equal(now.toISOString(), "2026-09-16T13:42:00.000Z");
});

test("daily timeline fills gaps without inventing activity", () => {
  const points = buildAnalyticsTimeline(
    new Date("2024-02-28T00:00:00Z"),
    new Date("2024-03-01T12:00:00Z"),
    false,
    [
      {
        bucket: new Date("2024-02-29T00:00:00Z"),
        starts: BigInt(4),
        completions: BigInt(2),
      },
    ],
  );
  assert.deepEqual(
    points.map((point) => [point.key, point.starts, point.completions]),
    [
      ["2024-02-28", 0, 0],
      ["2024-02-29", 4, 2],
      ["2024-03-01", 0, 0],
    ],
  );
});

test("90-day weekly timeline includes both partial edge weeks", () => {
  const { from, to } = analyticsPeriod(90, new Date("2026-09-16T12:00:00Z"));
  const points = buildAnalyticsTimeline(from, to, true, [
    { bucket: new Date("2026-06-15T00:00:00Z"), starts: 2, completions: 0 },
    { bucket: new Date("2026-09-14T00:00:00Z"), starts: 0, completions: 3 },
  ]);
  assert.equal(points[0].key, "2026-06-15");
  assert.equal(points.at(-1)?.key, "2026-09-14");
  assert.equal(
    points.reduce((sum, point) => sum + point.starts + point.completions, 0),
    5,
  );
});

test("a zero denominator or absent comparison is unavailable, not zero percent", () => {
  assert.equal(percent(0, 0), null);
  assert.equal(percent(0, 10), 0);
  assert.equal(percent(3, 4), 75);
  assert.equal(variation(5, 0), null);
  assert.equal(variation(0, 10), -100);
  assert.equal(variation(15, 10), 50);
});
