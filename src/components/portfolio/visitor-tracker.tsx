"use client";

import * as React from "react";

/**
 * VisitorTracker — fires a single POST /api/visitors/track on mount.
 *
 * Tracks: country (via IP geolocation), device type / OS / browser (via
 * User-Agent parsing server-side), and visit count per unique IP per day.
 *
 * Privacy notes:
 *   - We never store the raw IP. Server-side hashes the IP with a daily
 *     salt (SHA-256) so the same IP can be deduped per day, but the raw
 *     address isn't persisted anywhere.
 *   - Tracking is best-effort: any error is swallowed so the page render
 *     never breaks.
 *   - We track at most once per session per route to avoid double-counting
 *     navigations within the same SPA session.
 */
export function VisitorTracker() {
  React.useEffect(() => {
    const SESSION_KEY = "vt-fired";
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");

    // Use sendBeacon if available so the request survives page unloads.
    // Fallback to fetch otherwise.
    const fire = () => {
      try {
        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify({ ts: Date.now() })], {
            type: "application/json",
          });
          // sendBeacon returns false if the browser couldn't queue the request.
          if (navigator.sendBeacon("/api/visitors/track", blob)) return;
        }
        void fetch("/api/visitors/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ts: Date.now() }),
          keepalive: true,
        }).catch(() => {});
      } catch {
        // Swallow — never break the page render.
      }
    };
    // Fire after a short tick so it doesn't block first paint.
    const id = window.setTimeout(fire, 1500);
    return () => window.clearTimeout(id);
  }, []);

  return null;
}
