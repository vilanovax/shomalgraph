import { db } from "@/lib/db";
import { BadWordsClient } from "./BadWordsClient";

async function getBadWords() {
  try {
    const badWords = await db.badWord.findMany({
      orderBy: [
        { severity: "asc" },
        { word: "asc" },
      ],
    });
    return badWords;
  } catch (error) {
    console.error("Error fetching bad words:", error);
    return [];
  }
}

export default async function BadWordsPage() {
  const badWords = await getBadWords();

  const activeCount = badWords.filter((w) => w.isActive).length;
  const inactiveCount = badWords.length - activeCount;

  const severityCounts = {
    MILD: badWords.filter((w) => w.severity === "MILD").length,
    MODERATE: badWords.filter((w) => w.severity === "MODERATE").length,
    SEVERE: badWords.filter((w) => w.severity === "SEVERE").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-orange-700 to-yellow-600 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">مدیریت کلمات بد</h1>
              <p className="text-red-100 text-sm mt-1">
                فیلتر و مدیریت کلمات نامناسب در کامنت‌ها
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">کل کلمات</div>
          <div className="text-2xl font-bold">{badWords.length}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">فعال</div>
          <div className="text-2xl font-bold text-green-600">{activeCount}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">غیرفعال</div>
          <div className="text-2xl font-bold text-gray-600">{inactiveCount}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">شدید</div>
          <div className="text-2xl font-bold text-red-600">
            {severityCounts.SEVERE}
          </div>
        </div>
      </div>

      {/* Bad Words List */}
      <BadWordsClient initialBadWords={badWords} />
    </div>
  );
}

