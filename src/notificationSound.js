const SOUND_LOCK_KEY = "chatbot_notification_sound_lock";
const SOUND_DEDUP_WINDOW_MS = 450;

function nowMs() {
  return Date.now();
}

function canPlayAcrossTabs() {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(SOUND_LOCK_KEY);
    const lastPlayed = raw ? Number(raw) : 0;
    const now = nowMs();
    if (!Number.isFinite(lastPlayed) || lastPlayed <= 0 || lastPlayed > now + 10000) {
      return true;
    }
    if (now - lastPlayed < SOUND_DEDUP_WINDOW_MS) {
      return false;
    }
    return true;
  } catch {
    return true;
  }
}

function markPlayedNow() {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(SOUND_LOCK_KEY, String(nowMs())); } catch {}
}

export function createNotificationSound(url) {
  if (typeof Audio === "undefined") return null;
  const audio = new Audio(url);
  audio.preload = "auto";
  return audio;
}

export function playNotificationSoundSafe(audio) {
  if (!audio) return;
  if (!canPlayAcrossTabs()) return;
  try {
    audio.currentTime = 0;
    const maybePromise = audio.play();
    markPlayedNow();
    if (maybePromise && typeof maybePromise.catch === "function") {
      maybePromise.catch(() => {});
    }
  } catch {}
}
