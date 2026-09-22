import { NextResponse } from "next/server";

// In-memory cache for view counts to keep response time < 5ms and avoid rate limiting
const cache: Record<string, { views: number; formatted: string; timestamp: number }> = {};
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("id") || "9rdVSTtubOw";

  // Check cache first
  const now = Date.now();
  if (cache[videoId] && now - cache[videoId].timestamp < CACHE_TTL_MS) {
    return NextResponse.json({
      success: true,
      videoId,
      views: cache[videoId].views,
      formattedViews: cache[videoId].formatted,
      cached: true,
    });
  }

  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`YouTube responded with status ${res.status}`);
    }

    const html = await res.text();
    const matchCount = html.match(/"viewCount":\s*"(\d+)"/);
    const matchText = html.match(/viewCount":\{"simpleText":"([^"]+)"/);

    const views = matchCount ? parseInt(matchCount[1], 10) : 0;
    const formatted = matchText ? matchText[1] : (views > 0 ? `${views.toLocaleString("fr-FR")} vues` : "0 vue");

    cache[videoId] = {
      views,
      formatted,
      timestamp: now,
    };

    return NextResponse.json({
      success: true,
      videoId,
      views,
      formattedViews: formatted,
      cached: false,
    });
  } catch (error: any) {
    // If rate-limited or offline, return cached or fallback gracefully
    if (cache[videoId]) {
      return NextResponse.json({
        success: true,
        videoId,
        views: cache[videoId].views,
        formattedViews: cache[videoId].formatted,
        cached: true,
        fallback: true,
      });
    }

    return NextResponse.json(
      {
        success: false,
        videoId,
        views: 74,
        formattedViews: "74 vues",
        error: error?.message || "Failed to fetch views",
      },
      { status: 200 }
    );
  }
}
