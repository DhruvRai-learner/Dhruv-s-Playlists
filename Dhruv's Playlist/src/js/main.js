/**
 * Dhruv's Playlist — Main Controller
 *
 * Architecture:
 *   PlaylistApp (singleton)
 *   ├── Clock           — live clock display
 *   ├── OnlineCounter   — simulated user count
 *   ├── Slideshow       — background image rotation
 *   ├── PlayerEngine    — YouTube IFrame wrapper + transport
 *   ├── ProgressBar     — seek bar with pointer/keyboard control
 *   ├── DrawerUI        — song selection panel
 *   └── KeyboardShortcuts — global hotkeys
 */

import { setBeatSynthPlaying } from './beat-synth.js';
import { PLAYLISTS_DATA } from './playlists.js';
import { VisualEffects } from './effects.js';

export const BPM = 100;

// ============================================
// PLAYLIST DATA
// ============================================

/** @type {Array<{id: string, title: string, artist: string}>} */
const PLAYLIST_TRACKS = [
  { id: "CnEqrgMlWLQ", title: "I Think They Call This Love (Cover)", artist: "Matthew Ifield" },
  { id: "MHCsrKA9gh8", title: "blue", artist: "yung kai" },
  { id: "_uDU6LJucA8", title: "Boy In Love", artist: "Elliot James Reay" },
  { id: "QX2dqXr8mOU", title: "love.", artist: "wave to earth" },
  { id: "u3iR6FP2RpU", title: "Until I Found You (Em Beihold Version)", artist: "Stephen Sanchez" },
  { id: "a90tZJHBklk", title: "Sway", artist: "Michael Bublé" },
  { id: "YPeHGoGhHxg", title: "Those Eyes", artist: "New West" },
  { id: "Kf5pXDhx5Vc", title: "End of Beginning", artist: "Djo Music" },
  { id: "Qy9LTRu89FA", title: "My Love Mine All Mine", artist: "Mitski" },
  { id: "i8wWicZ1AM4", title: "夏夜露天电影 (Summer Night Open-Air Movie)", artist: "白色海岸The White Coast" },
  { id: "nyuo9-OjNNg", title: "I Wanna Be Yours", artist: "Arctic Monkey - Topic" },
  { id: "EAyY3_xWZYY", title: "bad", artist: "wave to earth" },
  { id: "axXLH7poX1Q", title: "佩奇的夏天 (佩奇的夏天)", artist: "阁楼演奏班 - Topic" },
  { id: "QrWTjjSgRyY", title: "A Piece of You", artist: "Nathaniel Constantin" },
  { id: "xnALK28rQ1w", title: "Bunga Maaf", artist: "The Lantis" },
  { id: "UiiWfiSZHJQ", title: "with you.", artist: "asumuh" },
  { id: "EdmpLGERRvQ", title: "About You", artist: "The 1975" },
  { id: "mEveOIoiHg4", title: "Here With Me", artist: "d4vd" },
  { id: "GtVxI5E0JHE", title: "THE SHADE", artist: "Rex Orange County" },
  { id: "k7kzc3Nof08", title: "I Love You So", artist: "The Walters" },
  { id: "OIK0Mi4iKrg", title: "There She Goes", artist: "Dream Tunes - Topic" },
  { id: "YzJW3lJeZa0", title: "Lily of The Valley", artist: "DANIEL - Topic" },
  { id: "M2YXsCzqbCk", title: "We (We)", artist: "酸月亮 Sour Moon - Topic" },
  { id: "oG32V_T3a68", title: "Romantic Sunday", artist: "카더가든 (Car, the garden)" },
  { id: "Fv204VxyMA8", title: "TRUE (TRUE)", artist: "Yoari - Topic" },
  { id: "ro3tNNE9wiw", title: "Take A Chance With Me", artist: "NIKI" },
  { id: "uV_5eEvamoQ", title: "golden hour", artist: "JVKE" },
  { id: "ESWcsKySnNs", title: "Sudden Shower", artist: "ECLIPSE - Topic" },
  { id: "DlFXDl_ROAM", title: "Die With A Smile", artist: "Lady Gaga" },
  { id: "i4YmKvw6mCY", title: "Saturn", artist: "SZA" },
  { id: "WKZO-CWeOVA", title: "BIRDS OF A FEATHER", artist: "Billie Eilish" },
  { id: "yHolH72dJzE", title: "Oceans & Engines", artist: "NIKI" },
  { id: "Uhy1vSygkvs", title: "Confess To You", artist: "LIM KIM" },
  { id: "EAnLyHsc3-Y", title: "I Think They Call This Love", artist: "Elliot James Reay" },
  { id: "XVveECQmiAk", title: "luther", artist: "Kendrick Lamar" },
  { id: "Bl0Gtp5FMd4", title: "You'll Be in My Heart", artist: "NIKI" },
  { id: "iU4kzRUMFyQ", title: "MONA LISA", artist: "j-hope - Topic" },
  { id: "Lk3UlEyIW84", title: "Always", artist: "Daniel Caesar" },
  { id: "nLR28v63pNs", title: "supernatural (remix)", artist: "Ariana Grande" },
  { id: "MsSIVZlqC9w", title: "I Like Me Better", artist: "Lauv" },
  { id: "HaZRGYd9mh4", title: "lowkey", artist: "NIKI" },
  { id: "LfhG2Ib75X0", title: "shoot", artist: "no na" },
  { id: "XRqMn6c0tsU", title: "Stay With Me", artist: "CHANYEOL - Topic" },
  { id: "txcNAN4rIJY", title: "Weak", artist: "larissa lambert" },
  { id: "Q6CRKXKpdSM", title: "Life Goes On", artist: "BANGTANTV" },
  { id: "gZ_UTJIwIdk", title: "Mean It", artist: "Lauv" },
  { id: "to_5UOAINLY", title: "Beautiful", artist: "Crush" },
  { id: "Q-erYa8cwnc", title: "작은 것들을 위한 시 (Boy with Luv) feat. Halsey", artist: "BANGTANTV" },
  { id: "jKajgKJn948", title: "L O V E", artist: "Michael Bublé" },
  { id: "IYOfGK5Zos4", title: "double take", artist: "Dhruv" },
  { id: "8BiLurrzFRw", title: "Night Changes", artist: "One Direction" },
  { id: "9_bTl2vvYQg", title: "Golden", artist: "HUNTR/X - Topic" },
  { id: "ORrFJ63nlcA", title: "Perfect", artist: "Ed Sheeran" },
  { id: "9Vxf1v0Kypw", title: "I Love You 3000", artist: "Stephanie Poetri" },
  { id: "0D28qd--kRE", title: "Euphoria", artist: "BANGTANTV" },
  { id: "IR7tYHdYN2Q", title: "To the Bone", artist: "Pamungkas" },
  { id: "yEA3qaB0dH8", title: "Stuck with U", artist: "Justin Bieber" },
  { id: "nujn6wbr-e8", title: "As It Was", artist: "Harry Styles" },
  { id: "5CB_bMJKRR8", title: "supernatural", artist: "Ariana Grande" },
  { id: "TR19QSL7WuQ", title: "Ordinary", artist: "Alex Warren" },
  { id: "BLhIcQMaaTI", title: "Shape of My Heart", artist: "Backstreet Boys" },
];

const YT_PLAYLIST_ID = "PLCAxG7on8A6bgJEAbXvfstliUopl0ibrN";

// ============================================
// UTILITIES
// ============================================

/** Query a required DOM element. Throws if missing. */
function $(selector) {
  const el = document.querySelector(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el;
}

/** Query an optional DOM element. Returns null if missing. */
function $maybe(selector) {
  return document.querySelector(selector);
}

/** Escape HTML for safe insertion */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/** Format seconds into M:SS */
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/** Announce to screen readers */
function announce(text) {
  const el = $maybe("#sr-announce");
  if (el) {
    el.textContent = "";
    // Force a DOM reflow so the AT picks up the change
    void el.offsetHeight;
    el.textContent = text;
  }
}

// ============================================
// CLOCK MODULE
// ============================================

class Clock {
  /** @param {HTMLElement} el */
  constructor(el) {
    this._el = el;
    this._tick();
    this._interval = setInterval(() => this._tick(), 1000);
  }

  _tick() {
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, "0");
    const ampm = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    this._el.textContent = `${h}:${m} ${ampm}`;
  }

  destroy() {
    clearInterval(this._interval);
  }
}

// ============================================
// ONLINE COUNTER MODULE
// ============================================

class OnlineCounter {
  /** @param {HTMLElement} el */
  constructor(el) {
    this._el = el;
    this._count = 18 + Math.floor(Math.random() * 25);
    this._render();
    this._interval = setInterval(() => this._drift(), 4000);
  }

  _drift() {
    const direction = Math.random() < 0.5 ? -1 : 1;
    const magnitude = Math.ceil(Math.random() * 2);
    this._count = Math.max(4, Math.min(80, this._count + direction * magnitude));
    this._render();
  }

  _render() {
    this._el.textContent = this._count;
  }

  destroy() {
    clearInterval(this._interval);
  }
}

// ============================================
// SLIDESHOW MODULE
// ============================================

class Slideshow {
  /**
   * @param {NodeListOf<HTMLElement>} slides
   * @param {number} intervalMs
   */
  constructor(slides, intervalMs = 12000) {
    this._slides = Array.from(slides);
    this._current = 0;
    this._intervalMs = intervalMs;

    if (this._slides.length <= 1) return;

    // Lazy-load background images
    this._slides.forEach((slide) => {
      const src = slide.dataset.bg;
      if (src) {
        slide.style.backgroundImage = `url('${src}')`;
      }
    });

    this._interval = setInterval(() => this._advance(), this._intervalMs);
  }

  _advance() {
    this._slides[this._current].classList.remove("active");
    this._current = (this._current + 1) % this._slides.length;
    this._slides[this._current].classList.add("active");
  }

  destroy() {
    clearInterval(this._interval);
  }
}

// ============================================
// PROGRESS BAR MODULE
// ============================================

class ProgressBarController {
  /**
   * @param {object} els
   * @param {() => {current: number, duration: number}} getTime
   * @param {(seconds: number) => void} onSeek
   */
  constructor(els, getTime, onSeek) {
    this._bar = els.bar;
    this._fill = els.fill;
    this._thumb = els.thumb;
    this._currentEl = els.currentTime;
    this._totalEl = els.totalTime;
    this._getTime = getTime;
    this._onSeek = onSeek;
    this._scrubbing = false;
    this._rafId = null;

    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);

    this._bar.addEventListener("pointerdown", this._onPointerDown);
    this._bar.addEventListener("keydown", this._onKeyDown);
  }

  startUpdating() {
    this.stopUpdating();
    const tick = () => {
      if (!this._scrubbing) this._updateFromPlayer();
      this._rafId = requestAnimationFrame(tick);
    };
    this._rafId = requestAnimationFrame(tick);
  }

  stopUpdating() {
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  /** Force a single update (e.g. on track change) */
  forceUpdate() {
    this._updateFromPlayer();
  }

  _updateFromPlayer() {
    const { current, duration } = this._getTime();
    if (!duration) return;
    const pct = Math.min(100, (current / duration) * 100);
    this._setPct(pct);
    this._currentEl.textContent = formatTime(current);
    this._totalEl.textContent = formatTime(duration);

    // Update ARIA
    this._bar.setAttribute("aria-valuenow", Math.round(pct));
    this._bar.setAttribute("aria-valuetext", `${formatTime(current)} of ${formatTime(duration)}`);
  }

  _setPct(pct) {
    this._fill.style.width = `${pct}%`;
    this._thumb.style.left = `${pct}%`;
  }

  _pctFromEvent(e) {
    const rect = this._bar.getBoundingClientRect();
    return Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
  }

  _onPointerDown(e) {
    this._scrubbing = true;
    this._bar.classList.add("is-scrubbing");
    this._bar.setPointerCapture(e.pointerId);

    const pct = this._pctFromEvent(e);
    this._setPct(pct * 100);

    const { duration } = this._getTime();
    if (duration) this._currentEl.textContent = formatTime(pct * duration);

    this._bar.addEventListener("pointermove", this._onPointerMove);
    this._bar.addEventListener("pointerup", this._onPointerUp);
    this._bar.addEventListener("pointercancel", this._onPointerUp);
  }

  _onPointerMove(e) {
    if (!this._scrubbing) return;
    const pct = this._pctFromEvent(e);
    this._setPct(pct * 100);

    const { duration } = this._getTime();
    if (duration) this._currentEl.textContent = formatTime(pct * duration);
  }

  _onPointerUp(e) {
    if (!this._scrubbing) return;
    const pct = this._pctFromEvent(e);
    const { duration } = this._getTime();
    if (duration) {
      this._onSeek(pct * duration);
    }
    this._scrubbing = false;
    this._bar.classList.remove("is-scrubbing");
    this._bar.removeEventListener("pointermove", this._onPointerMove);
    this._bar.removeEventListener("pointerup", this._onPointerUp);
    this._bar.removeEventListener("pointercancel", this._onPointerUp);
  }

  _onKeyDown(e) {
    const { current, duration } = this._getTime();
    if (!duration) return;
    let newTime = current;
    const step = 5; // seconds
    const bigStep = 15;

    switch (e.key) {
      case "ArrowRight":
        newTime = Math.min(duration, current + step);
        break;
      case "ArrowLeft":
        newTime = Math.max(0, current - step);
        break;
      case "ArrowUp":
        newTime = Math.min(duration, current + bigStep);
        break;
      case "ArrowDown":
        newTime = Math.max(0, current - bigStep);
        break;
      case "Home":
        newTime = 0;
        break;
      case "End":
        newTime = duration;
        break;
      default:
        return;
    }

    e.preventDefault();
    this._onSeek(newTime);
  }

  destroy() {
    this.stopUpdating();
    this._bar.removeEventListener("pointerdown", this._onPointerDown);
    this._bar.removeEventListener("keydown", this._onKeyDown);
  }
}

// ============================================
// DRAWER MODULE
// ============================================

class DrawerUI {
  /**
   * @param {object} params
   * @param {HTMLElement} params.drawer
   * @param {HTMLElement} params.list
   * @param {HTMLElement} params.toggleBtn
   * @param {HTMLElement} params.closeBtn
   * @param {(index: number) => void} params.onSelect
   * @param {() => number} params.getCurrentIndex
   * @param {() => boolean} params.isPlaying
   */
  constructor({ drawer, list, toggleBtn, closeBtn, onSelect, getCurrentIndex, isPlaying, isLiked, searchInput }) {
    this._drawer = drawer;
    this._list = list;
    this._toggleBtn = toggleBtn;
    this._closeBtn = closeBtn;
    this._onSelect = onSelect;
    this._getCurrentIndex = getCurrentIndex;
    this._isPlaying = isPlaying;
    this._isLiked = isLiked || (() => false);
    this._tracks = [];
    this._open = false;
    this._filterQuery = "";

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this._filterQuery = e.target.value.toLowerCase();
        this.render();
      });
    }

    this._toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggle();
    });

    this._closeBtn.addEventListener("click", () => this.close());

    document.addEventListener("click", (e) => {
      if (
        this._open &&
        !this._drawer.contains(e.target) &&
        !this._toggleBtn.contains(e.target)
      ) {
        this.close();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this._open) {
        this.close();
        this._toggleBtn.focus();
      }
    });
  }

  /** @param {Array<{id: string, title: string, artist: string}>} tracks */
  setTracks(tracks) {
    this._tracks = tracks;
    this.render();
  }

  toggle() {
    this._open ? this.close() : this.open();
  }

  open() {
    this._open = true;
    this._drawer.classList.add("is-open");
    this._toggleBtn.classList.add("is-active");
    this._toggleBtn.setAttribute("aria-expanded", "true");
    this._filterQuery = ""; // Reset filter on open
    const searchInput = document.getElementById("playlist-search");
    if (searchInput) searchInput.value = "";
    this.render();
    this._scrollToActive();
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 100);
    }
  }

  close() {
    this._open = false;
    this._drawer.classList.remove("is-open");
    this._toggleBtn.classList.remove("is-active");
    this._toggleBtn.setAttribute("aria-expanded", "false");
  }

  render() {
    const frag = document.createDocumentFragment();
    const currentIdx = this._getCurrentIndex();
    const playing = this._isPlaying();

    this._tracks.forEach((track, i) => {
      if (this._filterQuery) {
        const title = (track.title || "").toLowerCase();
        const artist = (track.artist || "").toLowerCase();
        if (!title.includes(this._filterQuery) && !artist.includes(this._filterQuery)) {
          return;
        }
      }

      const isActive = i === currentIdx;
      const item = document.createElement("div");
      item.className = `song-item${isActive ? " is-active" : ""}`;
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", isActive ? "true" : "false");
      item.tabIndex = 0;

      item.innerHTML = `
        <span class="song-num">${String(i + 1).padStart(2, "0")}</span>
        <img
          class="song-thumb"
          src="https://i.ytimg.com/vi/${track.id}/hqdefault.jpg"
          alt=""
          loading="lazy"
          onerror="this.style.visibility='hidden'"
        />
        <div class="song-details">
          <span class="song-item-title">${escapeHtml(track.title)}</span>
          <span class="song-item-artist">${escapeHtml(track.artist)}</span>
        </div>
        ${
          this._isLiked(track.id)
            ? `<div class="song-item-like-icon" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></div>`
            : ""
        }
        ${
          isActive && playing
            ? `<div class="playing-bars" aria-hidden="true">
                 <div class="playing-bar"></div>
                 <div class="playing-bar"></div>
                 <div class="playing-bar"></div>
               </div>`
            : ""
        }
      `;

      const select = () => {
        this._onSelect(i);
        this.render();
      };

      item.addEventListener("click", select);
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          select();
        }
      });

      frag.appendChild(item);
    });

    this._list.innerHTML = "";
    this._list.appendChild(frag);
  }

  _scrollToActive() {
    requestAnimationFrame(() => {
      const activeItem = this._list.querySelector(".song-item.is-active");
      if (activeItem) {
        activeItem.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    });
  }

  destroy() {
    this._list.innerHTML = "";
  }
}

// ============================================
// PLAYER ENGINE
// ============================================

class PlayerEngine {
  /**
   * @param {object} params
   * @param {string} params.playlistId
   * @param {Array<{id: string, title: string, artist: string}>} params.tracks
   * @param {number} [params.startIndex=0]
   * @param {number} [params.startTime=0]
   */
  constructor({ playlistId, tracks, startIndex = 0, startTime = 0 }) {
    this._playlistId = playlistId;
    this._tracks = tracks;
    this._startIndex = startIndex;
    this._startTime = startTime;
    this._player = null;
    this._ready = false;
    this._currentIndex = startIndex;
    this._muted = false;
    this._shuffled = false;
    this._hasPlayedAtLeastOnce = false;

    /** @type {Set<(state: string, data?: any) => void>} */
    this._listeners = new Set();

    // Expose the global callback
    window.onYouTubeIframeAPIReady = () => this._initPlayer();

    // If the API was already loaded before this class instantiated
    if (window.YT && window.YT.Player) {
      this._initPlayer();
    }
  }

  /** Subscribe to state changes */
  on(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  _emit(state, data) {
    for (const fn of this._listeners) {
      try {
        fn(state, data);
      } catch (err) {
        console.error("[PlayerEngine] listener error:", err);
      }
    }
  }

  _initPlayer() {
    const initialTrackId = (this._tracks && this._tracks[this._startIndex]) ? this._tracks[this._startIndex].id : "CnEqrgMlWLQ";
    this._player = new YT.Player("yt-player", {
      height: "1",
      width: "1",
      playerVars: {
        videoId: initialTrackId,
        start: Math.floor(this._startTime),
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        playsinline: 1,
        rel: 0,
      },
      events: {
        onReady: () => this._onReady(),
        onStateChange: (e) => this._onStateChange(e),
        onError: (e) => this._onError(e),
      },
    });
  }

  _onReady() {
    this._ready = true;
    this._player.setLoop(true);
    this._syncIndex();
    if (this._startTime > 0) {
      this._player.seekTo(this._startTime, true);
    }
    this._emit("ready");
  }

  _onStateChange(event) {
    const state = event.data;

    this._syncIndex();

    switch (state) {
      case YT.PlayerState.PLAYING:
        this._hasPlayedAtLeastOnce = true;
        this._emit("playing");
        break;
      case YT.PlayerState.PAUSED:
        this._emit("paused");
        break;
      case YT.PlayerState.ENDED:
        this._emit("ended");
        this.next();
        break;
      case YT.PlayerState.BUFFERING:
        this._emit("buffering");
        break;
      case YT.PlayerState.CUED:
        this._emit("cued");
        break;
    }
  }

  _onError(event) {
    console.warn("[PlayerEngine] YT error code:", event.data);
    // Auto-skip on unplayable videos
    if ([2, 5, 100, 101, 150].includes(event.data)) {
      setTimeout(() => this.next(this._hasPlayedAtLeastOnce), 1500);
    }
  }

  _syncIndex() {
    // Index is directly managed by _currentIndex
  }

  // ---- Public API ----

  get currentIndex() {
    return this._currentIndex;
  }

  updateTracks(tracks) {
    this._tracks = tracks;
  }

  get isPlaying() {
    if (!this._ready) return false;
    try {
      return this._player.getPlayerState() === YT.PlayerState.PLAYING;
    } catch {
      return false;
    }
  }

  get isMuted() {
    return this._muted;
  }

  getTrackData() {
    if (!this._ready || typeof this._player.getVideoData !== "function") return null;
    try {
      return this._player.getVideoData();
    } catch {
      return null;
    }
  }

  getTime() {
    if (!this._ready) return { current: 0, duration: 0 };
    try {
      return {
        current: this._player.getCurrentTime() || 0,
        duration: this._player.getDuration() || 0,
      };
    } catch {
      return { current: 0, duration: 0 };
    }
  }

  togglePlay() {
    if (!this._ready) return;
    if (this.isPlaying) {
      this._player.pauseVideo();
    } else {
      this._player.playVideo();
    }
  }

  next(autoPlay = true) {
    if (!this._ready) return;
    const firstTrackHasId = this._tracks && this._tracks[0] && this._tracks[0].id;
    if (firstTrackHasId) {
      if (this._shuffled) {
        this._currentIndex = Math.floor(Math.random() * this._tracks.length);
      } else {
        this._currentIndex = (this._currentIndex + 1) % this._tracks.length;
      }
      this.playAt(this._currentIndex, autoPlay);
    } else {
      if (typeof this._player.nextVideo === "function") {
        this._player.nextVideo();
      }
    }
  }

  prev(autoPlay = true) {
    if (!this._ready) return;
    const firstTrackHasId = this._tracks && this._tracks[0] && this._tracks[0].id;
    if (firstTrackHasId) {
      const { current } = this.getTime();
      if (current > 3) {
        this._player.seekTo(0, true);
      } else {
        if (this._shuffled) {
          this._currentIndex = Math.floor(Math.random() * this._tracks.length);
        } else {
          this._currentIndex = (this._currentIndex - 1 + this._tracks.length) % this._tracks.length;
        }
        this.playAt(this._currentIndex, autoPlay);
      }
    } else {
      if (typeof this._player.previousVideo === "function") {
        this._player.previousVideo();
      }
    }
  }

  playAt(index, autoPlay = true) {
    if (!this._ready) return;
    this._currentIndex = index;
    const track = this._tracks ? this._tracks[index] : null;
    try {
      if (track && track.id) {
        if (autoPlay) {
          this._player.loadVideoById(track.id);
        } else {
          this._player.cueVideoById(track.id);
        }
      } else {
        if (typeof this._player.playVideoAt === "function") {
          this._player.playVideoAt(index);
        } else if (typeof this._player.loadPlaylist === "function") {
          this._player.loadPlaylist({
            list: this._playlistId,
            listType: "playlist",
            index: index
          });
        }
      }
    } catch (e) {
      console.warn("[PlayerEngine] playAt error:", e);
    }
  }

  seekTo(seconds) {
    if (!this._ready) return;
    this._player.seekTo(seconds, true);
  }

  toggleMute() {
    if (!this._ready) return;
    this._muted = !this._muted;
    if (this._muted) {
      this._player.mute();
    } else {
      this._player.unMute();
    }
    this._emit("mutechange", { muted: this._muted });
  }

  toggleShuffle() {
    if (!this._ready) return false;
    this._shuffled = !this._shuffled;
    try {
      this._player.setShuffle(this._shuffled);
    } catch (e) {
      console.warn("[PlayerEngine] setShuffle error:", e);
    }
    return this._shuffled;
  }

  loadPlaylist(playlistId, tracks, autoPlay = true) {
    this._playlistId = playlistId;
    if (tracks) this._tracks = tracks;
    this._currentIndex = 0;
    if (this._ready) {
      try {
        const firstTrackHasId = this._tracks && this._tracks[0] && this._tracks[0].id;
        if (firstTrackHasId) {
          if (autoPlay) {
            this._player.loadVideoById(this._tracks[0].id);
          } else {
            this._player.cueVideoById(this._tracks[0].id);
          }
        } else if (typeof this._player.loadPlaylist === "function") {
          this._player.loadPlaylist({
            list: playlistId,
            listType: "playlist",
            index: 0
          });
          if (!autoPlay && typeof this._player.pauseVideo === "function") {
            setTimeout(() => this._player.pauseVideo(), 600);
          }
        }
      } catch (e) {
        console.warn("[PlayerEngine] loadPlaylist error:", e);
      }
    }
  }
}

// ============================================
// MAIN APP
// ============================================

class PlaylistApp {
  constructor() {
    // DOM refs
    this._els = {
      clock: $("#clock"),
      userCount: $("#user-count"),
      playerCard: $("#player-card"),
      albumArt: $("#album-art-img"),
      trackTitle: $("#track-title"),
      trackArtist: $("#track-artist"),
      playBtn: $("#play-btn"),
      playIcon: $("#play-icon"),
      pauseIcon: $("#pause-icon"),
      prevBtn: $("#prev-btn"),
      nextBtn: $("#next-btn"),
      shuffleBtn: $("#shuffle-btn"),
      playlistBtn: $("#playlist-btn"),
      closeDrawerBtn: $("#close-drawer-btn"),
      drawer: $("#playlist-drawer"),
      customSelectWrapper: $maybe("#custom-playlist-select"),
      customSelectTrigger: $maybe(".custom-select-trigger"),
      customSelectLabel: $maybe(".custom-select-label"),
      customSelectOptions: $maybe(".custom-select-options"),
      searchInput: $maybe("#playlist-search"),
      songList: $("#song-list"),
      likeBtn: $maybe("#like-btn"),
      likeIconOutline: $maybe("#like-icon-outline"),
      likeIconFilled: $maybe("#like-icon-filled"),
      copyBtn: $maybe("#copy-btn"),
      copyIcon: $maybe("#copy-icon"),
      checkIcon: $maybe("#check-icon"),
      progressBar: $("#progress-bar"),
      progressFill: $("#progress-fill"),
      progressThumb: $("#progress-thumb"),
      currentTime: $("#current-time"),
      totalTime: $("#total-time"),
      volumeBtn: $maybe("#volume-btn"),
      volIconOn: $maybe("#vol-icon-on"),
      volIconOff: $maybe("#vol-icon-off"),
    };

    this._tracks = PLAYLIST_TRACKS;

    // Modules
    this._clock = new Clock(this._els.clock);
    this._counter = new OnlineCounter(this._els.userCount);
    this._slideshow = new Slideshow(document.querySelectorAll(".bg-slide"));
    this._effects = new VisualEffects($("#effects-canvas"), $maybe("#effects-toggle"));

    let startIndex = 0;
    let startTime = 0;
    try {
      const saved = JSON.parse(localStorage.getItem("playlist_saved_state"));
      if (saved) {
        startIndex = saved.index || 0;
        startTime = saved.time || 0;
      }
    } catch (e) {}

    let liked = [];
    try {
      liked = JSON.parse(localStorage.getItem("playlist_liked_tracks") || "[]");
    } catch (e) {}
    this._likedTracks = new Set(liked);

    this._activePlaylistId = YT_PLAYLIST_ID;
    this._exploredPlaylistId = YT_PLAYLIST_ID;

    this._engine = new PlayerEngine({
      playlistId: YT_PLAYLIST_ID,
      tracks: this._tracks,
      startIndex,
      startTime,
    });

    this._progressBar = new ProgressBarController(
      {
        bar: this._els.progressBar,
        fill: this._els.progressFill,
        thumb: this._els.progressThumb,
        currentTime: this._els.currentTime,
        totalTime: this._els.totalTime,
      },
      () => this._engine.getTime(),
      (sec) => this._engine.seekTo(sec)
    );

    this._drawer = new DrawerUI({
      drawer: this._els.drawer,
      list: this._els.songList,
      toggleBtn: this._els.playlistBtn,
      closeBtn: this._els.closeDrawerBtn,
      onSelect: (i) => {
        if (this._activePlaylistId !== this._exploredPlaylistId) {
          this._activePlaylistId = this._exploredPlaylistId;
          const selectedOptionText = this._els.customSelectLabel ? this._els.customSelectLabel.textContent : "Playlist";
          this._updateHeroTitle(selectedOptionText);
          
          let exploredTracks = PLAYLIST_TRACKS;
          if (PLAYLISTS_DATA && PLAYLISTS_DATA[this._activePlaylistId]) {
            exploredTracks = PLAYLISTS_DATA[this._activePlaylistId];
          }
          this._tracks = exploredTracks;

          this._engine.loadPlaylist(this._activePlaylistId, this._tracks, false);
        }
        this._engine.playAt(i);
        this._updateTrackDisplay();
      },
      getCurrentIndex: () => {
        if (this._activePlaylistId === this._exploredPlaylistId) {
          return this._engine.currentIndex;
        }
        return -1;
      },
      isPlaying: () => this._engine.isPlaying,
      isLiked: (id) => this._likedTracks.has(id),
      searchInput: this._els.searchInput,
    });

    this._drawer.setTracks(this._tracks);

    this._bindEngine();
    this._bindControls();
    this._bindKeyboard();

    // Save state periodically
    setInterval(() => {
      if (this._engine.isPlaying) {
        const { current } = this._engine.getTime();
        localStorage.setItem("playlist_saved_state", JSON.stringify({ index: this._engine.currentIndex, time: current }));
      }
    }, 2000);
  }

  _bindEngine() {
    this._engine.on((state) => {
      switch (state) {
        case "ready":
          this._updateTrackDisplay();
          this._drawer.render();
          break;

        case "playing":
          this._setPlayingUI(true);
          this._updateTrackDisplay();
          this._progressBar.startUpdating();
          this._drawer.render();
          break;

        case "paused":
          this._setPlayingUI(false);
          this._progressBar.stopUpdating();
          this._progressBar.forceUpdate();
          this._drawer.render();
          break;

        case "ended":
          this._setPlayingUI(false);
          this._progressBar.stopUpdating();
          break;

        case "buffering":
        case "cued":
          this._updateTrackDisplay();
          break;

        case "mutechange":
          this._updateVolumeIcon();
          break;
      }
    });
  }

  _bindControls() {
    this._els.playBtn.addEventListener("click", () => this._engine.togglePlay());
    this._els.nextBtn.addEventListener("click", () => this._engine.next());
    this._els.prevBtn.addEventListener("click", () => this._engine.prev());

    this._els.shuffleBtn.addEventListener("click", () => {
      const isShuffle = this._engine.toggleShuffle();
      this._els.shuffleBtn.setAttribute("aria-pressed", isShuffle ? "true" : "false");
      if (isShuffle) {
        this._els.shuffleBtn.classList.add("is-active");
      } else {
        this._els.shuffleBtn.classList.remove("is-active");
      }
    });

    if (this._els.likeBtn) {
      this._els.likeBtn.addEventListener("click", () => this._toggleLike());
    }

    if (this._els.copyBtn) {
      this._els.copyBtn.addEventListener("click", () => this._copyLink());
    }

    if (this._els.customSelectWrapper) {
      const wrapper = this._els.customSelectWrapper;
      const trigger = this._els.customSelectTrigger;
      const optionsMenu = this._els.customSelectOptions;
      const label = this._els.customSelectLabel;

      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = wrapper.classList.toggle("is-open");
        trigger.setAttribute("aria-expanded", isOpen);
      });

      optionsMenu.addEventListener("click", (e) => {
        const option = e.target.closest(".custom-select-option");
        if (!option) return;

        optionsMenu.querySelectorAll(".custom-select-option").forEach(opt => {
          opt.classList.remove("is-selected");
          opt.setAttribute("aria-selected", "false");
        });
        option.classList.add("is-selected");
        option.setAttribute("aria-selected", "true");

        label.textContent = option.textContent;
        
        wrapper.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");

        const newPlaylistId = option.dataset.value;
        this._exploredPlaylistId = newPlaylistId;

        let exploredTracks = PLAYLIST_TRACKS;
        if (PLAYLISTS_DATA && PLAYLISTS_DATA[newPlaylistId]) {
          exploredTracks = PLAYLISTS_DATA[newPlaylistId];
        }

        this._drawer.setTracks(exploredTracks);
        this._drawer.render();
      });

      document.addEventListener("click", (e) => {
        if (!wrapper.contains(e.target)) {
          wrapper.classList.remove("is-open");
          trigger.setAttribute("aria-expanded", "false");
        }
      });
    }

    if (this._els.volumeBtn) {
      this._els.volumeBtn.addEventListener("click", () => this._engine.toggleMute());
    }
  }

  _bindKeyboard() {
    document.addEventListener("keydown", (e) => {
      // Don't capture if user is in an input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      switch (e.key) {
        case " ":
          // Only prevent if not focused on a button (let buttons handle their own space)
          if (e.target.tagName !== "BUTTON") {
            e.preventDefault();
            this._engine.togglePlay();
          }
          break;
        case "ArrowRight":
          if (!this._els.progressBar.contains(e.target)) {
            // Global skip vs. progress bar seek handled by ProgressBarController
          }
          break;
        case "n":
        case "N":
          if (!e.metaKey && !e.ctrlKey) this._engine.next();
          break;
        case "p":
        case "P":
          if (!e.metaKey && !e.ctrlKey) this._engine.prev();
          break;
        case "m":
        case "M":
          if (!e.metaKey && !e.ctrlKey) this._engine.toggleMute();
          break;
        case "s":
        case "S":
          if (!e.metaKey && !e.ctrlKey) {
            const isShuffle = this._engine.toggleShuffle();
            this._els.shuffleBtn.setAttribute("aria-pressed", isShuffle ? "true" : "false");
            if (isShuffle) {
              this._els.shuffleBtn.classList.add("is-active");
            } else {
              this._els.shuffleBtn.classList.remove("is-active");
            }
          }
          break;
        case "l":
        case "L":
          if (!e.metaKey && !e.ctrlKey) this._toggleLike();
          break;
        case "c":
        case "C":
          if (!e.metaKey && !e.ctrlKey) this._copyLink();
          break;
      }
    });
  }

  _updateHeroTitle(name) {
    if (!name) return;
    const kickerEl = document.getElementById("hero-kicker-text");
    const scriptEl = document.getElementById("hero-script-text");
    if (!kickerEl || !scriptEl) return;

    if (name.includes("Mixtape")) {
      kickerEl.textContent = "DHRUV’S";
      scriptEl.textContent = "Mixtape";
    } else if (name.includes("Bollywood")) {
      kickerEl.textContent = "BOLLYWOOD";
      scriptEl.textContent = "Hits";
    } else if (name.includes("Sufi")) {
      kickerEl.textContent = "SUFI &";
      scriptEl.textContent = "Soulful";
    } else {
      const parts = name.split(" ");
      if (parts.length > 1) {
        kickerEl.textContent = parts[0].toUpperCase();
        scriptEl.textContent = parts.slice(1).join(" ");
      } else {
        kickerEl.textContent = "PLAYLIST";
        scriptEl.textContent = name;
      }
    }
  }

  _updateTrackDisplay() {
    const data = this._engine.getTrackData();
    const idx = this._engine.currentIndex;
    const fallback = this._tracks ? this._tracks[idx] : null;

    const hasRealFallbackId = fallback && fallback.id && fallback.id !== "";
    const title = (hasRealFallbackId ? fallback.title : null) || data?.title || fallback?.title || "Untitled Track";
    const artist = (hasRealFallbackId ? fallback.artist : null) || data?.author || fallback?.artist || "Unknown Artist";
    const videoId = (hasRealFallbackId ? fallback.id : null) || data?.video_id;

    this._els.trackTitle.textContent = title;
    this._els.trackArtist.textContent = artist;

    if (videoId) {
      this._els.albumArt.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      this._els.albumArt.alt = `${title} by ${artist}`;
    }

    // Update document title
    if (this._engine.isPlaying) {
      document.title = `${title} - DHRUV'S Mixtape`;
    }

    // Screen reader announcement
    if (this._engine.isPlaying) {
      announce(`Now playing: ${title} by ${artist}`);
    }

    this._updateLikeUI();
    this._progressBar.forceUpdate();
  }

  _updateLikeUI() {
    if (!this._els.likeBtn) return;
    const data = this._engine.getTrackData();
    const idx = this._engine.currentIndex;
    const fallback = this._tracks[idx];
    const videoId = fallback?.id || data?.video_id;

    if (!videoId) return;
    const isLiked = this._likedTracks.has(videoId);

    this._els.likeIconOutline.classList.toggle("hidden", isLiked);
    this._els.likeIconFilled.classList.toggle("hidden", !isLiked);
    this._els.likeBtn.classList.toggle("is-active", isLiked);
    this._els.likeBtn.setAttribute("aria-pressed", isLiked ? "true" : "false");
  }

  _toggleLike() {
    const data = this._engine.getTrackData();
    const idx = this._engine.currentIndex;
    const fallback = this._tracks[idx];
    const videoId = fallback?.id || data?.video_id;

    if (!videoId) return;

    if (this._likedTracks.has(videoId)) {
      this._likedTracks.delete(videoId);
    } else {
      this._likedTracks.add(videoId);
    }

    localStorage.setItem("playlist_liked_tracks", JSON.stringify([...this._likedTracks]));
    this._updateLikeUI();
    this._drawer.render(); // Re-render to update heart icons in drawer
  }

  async _copyLink() {
    const data = this._engine.getTrackData();
    const idx = this._engine.currentIndex;
    const fallback = this._tracks[idx];
    const videoId = fallback?.id || data?.video_id;

    if (!videoId) return;
    const url = `https://youtu.be/${videoId}`;

    try {
      await navigator.clipboard.writeText(url);
      if (this._els.copyIcon && this._els.checkIcon) {
        this._els.copyIcon.classList.add("hidden");
        this._els.checkIcon.classList.remove("hidden");
        this._els.copyBtn.classList.add("is-active");
        setTimeout(() => {
          this._els.copyIcon.classList.remove("hidden");
          this._els.checkIcon.classList.add("hidden");
          this._els.copyBtn.classList.remove("is-active");
        }, 2000);
      }
    } catch (e) {
      console.warn("Failed to copy link", e);
    }
  }

  _setPlayingUI(playing) {
    this._els.playerCard.classList.toggle("is-playing", playing);
    this._els.playIcon.classList.toggle("hidden", playing);
    this._els.pauseIcon.classList.toggle("hidden", !playing);
    this._els.playBtn.setAttribute("aria-label", playing ? "Pause" : "Play");

    setBeatSynthPlaying(playing);

    if (!playing) {
      document.title = "DHRUV'S Mixtape";
    }
  }

  _updateVolumeIcon() {
    const muted = this._engine.isMuted;
    if (this._els.volIconOn) this._els.volIconOn.classList.toggle("hidden", muted);
    if (this._els.volIconOff) this._els.volIconOff.classList.toggle("hidden", !muted);
    if (this._els.volumeBtn) {
      this._els.volumeBtn.setAttribute("aria-label", muted ? "Unmute" : "Mute");
    }
  }
}

// ============================================
// BOOT
// ============================================

const app = new PlaylistApp();
