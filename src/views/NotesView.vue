<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";
import {
  getCategoryTone,
  NOTE_CATEGORIES,
  readSavedNoteCategories,
  saveNoteCategory,
} from "../utils/noteCategories";

const logoUrl = `${import.meta.env.BASE_URL.replace(/\/?$/, "/")}noteme-logo.png`;

interface Note {
  id: number;
  title: string;
  content: string | null;
  category?: string | null;
  createdAt: string;
  updatedAt: string;
}

type NoteFilter = "all" | "recent" | "favorites";

const router = useRouter();
const notes = ref<Note[]>([]);
const loading = ref(true);
const errorMessage = ref("");
const searchQuery = ref("");
const sortOption = ref("newest");
const activeFilter = ref<NoteFilter>("all");
const activeCategory = ref("");
const isDark = ref(false);
const favoriteIds = ref<number[]>([]);
const userName = ref("there");

const thisWeekCount = computed(() => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return notes.value.filter((note) => new Date(note.createdAt) >= weekAgo).length;
});

const filteredNotes = computed(() => {
  let result = [...notes.value];
  const search = searchQuery.value.trim().toLowerCase();

  if (activeFilter.value === "recent") {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    result = result.filter((note) => new Date(note.createdAt) >= weekAgo);
  } else if (activeFilter.value === "favorites") {
    result = result.filter((note) => favoriteIds.value.includes(note.id));
  }

  if (activeCategory.value === "__uncategorized__") {
    result = result.filter((note) => !note.category);
  } else if (activeCategory.value) {
    result = result.filter((note) => note.category === activeCategory.value);
  }

  if (search) {
    result = result.filter(
      (note) =>
        note.title.toLowerCase().includes(search) ||
        (note.content ?? "").toLowerCase().includes(search),
    );
  }

  if (sortOption.value === "newest") {
    result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } else if (sortOption.value === "oldest") {
    result.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  } else {
    result.sort((a, b) => a.title.localeCompare(b.title));
  }

  return result;
});

const loadNotes = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await api.get<Note[]>("/Notes");
    const savedCategories = readSavedNoteCategories();
    notes.value = response.data.map((note) => ({
      ...note,
      category:
        note.category || savedCategories[String(note.id)] || null,
    }));
  } catch (error: any) {
    console.error(error);
    errorMessage.value =
      error?.response?.data?.message || "Unable to load your notes.";
  } finally {
    loading.value = false;
  }
};

const loadPreferences = () => {
  isDark.value = localStorage.getItem("theme") === "dark";

  try {
    const savedFavorites = JSON.parse(
      localStorage.getItem("favoriteNotes") ?? "[]",
    );
    favoriteIds.value = Array.isArray(savedFavorites)
      ? savedFavorites.filter((id): id is number => Number.isInteger(id))
      : [];
  } catch (error) {
    console.error("Unable to read saved favorites.", error);
    favoriteIds.value = [];
  }

  try {
    const user = JSON.parse(localStorage.getItem("user") ?? "{}");
    const name = user.username ?? user.name ?? user.email?.split("@")[0];
    if (typeof name === "string" && name.trim()) {
      userName.value = name.trim();
    }
  } catch (error) {
    console.error("Unable to read the saved user profile.", error);
  }
};

const toggleTheme = () => {
  isDark.value = !isDark.value;
  localStorage.setItem("theme", isDark.value ? "dark" : "light");
};

const toggleFavorite = (id: number) => {
  favoriteIds.value = favoriteIds.value.includes(id)
    ? favoriteIds.value.filter((favoriteId) => favoriteId !== id)
    : [...favoriteIds.value, id];
  localStorage.setItem("favoriteNotes", JSON.stringify(favoriteIds.value));
};

const createNote = () => router.push("/notes/create");
const viewNote = (id: number) => router.push(`/notes/${id}`);
const editNote = (id: number) => router.push(`/notes/${id}/edit`);

const deleteNote = async (id: number) => {
  if (!window.confirm("Are you sure you want to delete this note?")) return;

  try {
    await api.delete(`/Notes/${id}`);
    saveNoteCategory(id, "");
    notes.value = notes.value.filter((note) => note.id !== id);
    favoriteIds.value = favoriteIds.value.filter((favoriteId) => favoriteId !== id);
    localStorage.setItem("favoriteNotes", JSON.stringify(favoriteIds.value));
  } catch (error: any) {
    console.error(error);
    window.alert(error?.response?.data?.message || "Failed to delete note.");
  }
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  router.push("/login");
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

onMounted(() => {
  loadPreferences();
  loadNotes();
});
</script>

<template>
  <div class="dashboard" :class="{ 'dashboard--dark': isDark }">
    <aside class="sidebar">
      <a class="brand" href="#/notes" aria-label="NoteMe home">
        <span class="brand__mark"><img :src="logoUrl" alt="" /></span>
        <span class="brand__copy">
          <strong>NoteMe</strong>
          <small>Your personal notes</small>
        </span>
      </a>

      <div class="sidebar__label">WORKSPACE</div>
      <nav class="side-nav" aria-label="Notes">
        <button
          class="side-nav__item"
          :class="{ 'side-nav__item--active': activeFilter === 'all' }"
          @click="activeFilter = 'all'"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1z" /></svg>
          <span>My Notes</span>
          <span class="side-nav__count">{{ notes.length }}</span>
        </button>
        <button
          class="side-nav__item"
          :class="{ 'side-nav__item--active': activeFilter === 'favorites' }"
          @click="activeFilter = 'favorites'"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 20-1.4-1.3C5.6 14.1 2.5 11.3 2.5 7.8A5.2 5.2 0 0 1 7.8 2.5c1.6 0 3.2.8 4.2 2a5.6 5.6 0 0 1 4.2-2 5.2 5.2 0 0 1 5.3 5.3c0 3.5-3.1 6.3-8.1 10.9z" /></svg>
          <span>Favorites</span>
          <span class="side-nav__count">{{ favoriteIds.length }}</span>
        </button>
        <button
          class="side-nav__item"
          :class="{ 'side-nav__item--active': activeFilter === 'recent' }"
          @click="activeFilter = 'recent'"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
          <span>This week</span>
          <span class="side-nav__count">{{ thisWeekCount }}</span>
        </button>
      </nav>

      <div class="sidebar__label sidebar__label--lower">QUICK TIP</div>
      <div class="sidebar-tip">
        <span class="sidebar-tip__sparkle">✦</span>
        <strong>Stay organized</strong>
        <p>Keep your thoughts in one place and find them whenever you need.</p>
      </div>

      <div class="sidebar__footer">
        <span class="avatar avatar--small">{{ userName.charAt(0).toUpperCase() }}</span>
        <span class="sidebar__username">{{ userName }}</span>
        <button class="icon-button sidebar__logout" aria-label="Log out" title="Log out" @click="logout">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17l5-5-5-5M15 12H3m9-8h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7" /></svg>
        </button>
      </div>
    </aside>

    <main class="main-area">
      <header class="topbar">
        <label class="search-box">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
          <input v-model="searchQuery" type="search" placeholder="Search notes by title or content..." />
          <kbd>⌘ K</kbd>
        </label>
        <div class="topbar__actions">
          <button class="icon-button theme-button" :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'" @click="toggleTheme">
            <svg v-if="!isDark" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
            <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" /></svg>
          </button>
          <button class="profile-button" @click="logout" title="Log out">
            <span class="avatar">{{ userName.charAt(0).toUpperCase() }}</span>
            <span class="profile-button__name">{{ userName }}</span>
            <svg class="profile-button__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5" /></svg>
          </button>
        </div>
      </header>

      <div class="dashboard-content">
        <section class="welcome-banner">
          <div class="welcome-banner__copy">
            <span class="eyebrow">YOUR SPACE, YOUR THOUGHTS</span>
            <h1>Good to see you, {{ userName }}</h1>
            <p>Capture your thoughts, ideas, and everything that matters.</p>
          </div>
          <div class="welcome-art" aria-hidden="true">
            <div class="welcome-art__plant"><i></i><i></i><i></i></div>
            <div class="welcome-art__paper welcome-art__paper--back"></div>
            <div class="welcome-art__paper welcome-art__paper--front">
              <span></span><span></span><span></span>
            </div>
          </div>
          <p class="welcome-quote">“A small note today<br />can be a big idea tomorrow.”</p>
        </section>

        <section class="stats-grid" aria-label="Notes overview">
          <article class="stat-card">
            <span class="stat-icon stat-icon--blue">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l3 3v15H6zM15 3v4h4M9 12h6m-6 4h6" /></svg>
            </span>
            <span class="stat-card__text"><strong>{{ notes.length }}</strong><small>Total notes</small></span>
            <span class="stat-card__meta">All time</span>
          </article>
          <article class="stat-card">
            <span class="stat-icon stat-icon--green">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18m-13 4h.01M12 14h.01M15 14h.01M8 17h.01M12 17h.01" /></svg>
            </span>
            <span class="stat-card__text"><strong>{{ thisWeekCount }}</strong><small>Created this week</small></span>
            <span class="stat-card__meta stat-card__meta--green">Last 7 days</span>
          </article>
          <article class="stat-card">
            <span class="stat-icon stat-icon--rose">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 20-1.4-1.3C5.6 14.1 2.5 11.3 2.5 7.8A5.2 5.2 0 0 1 7.8 2.5c1.6 0 3.2.8 4.2 2a5.6 5.6 0 0 1 4.2-2 5.2 5.2 0 0 1 5.3 5.3c0 3.5-3.1 6.3-8.1 10.9z" /></svg>
            </span>
            <span class="stat-card__text"><strong>{{ favoriteIds.length }}</strong><small>Favorites</small></span>
            <span class="stat-card__meta">Saved by you</span>
          </article>
          <article class="stat-card stat-card--accent">
            <span class="stat-icon stat-icon--purple">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 13 13 20a2 2 0 0 1-3 0l-6-6V4h10l6 6a2 2 0 0 1 0 3Z" /><circle cx="8" cy="8" r="1" /></svg>
            </span>
            <span class="stat-card__text"><strong>{{ filteredNotes.length }}</strong><small>Showing now</small></span>
            <span class="stat-card__meta">In this view</span>
          </article>
        </section>

        <section class="notes-section">
          <div class="notes-heading">
            <div>
              <span class="eyebrow">YOUR COLLECTION</span>
              <h2>{{ activeFilter === "favorites" ? "Favorite Notes" : activeFilter === "recent" ? "This Week" : "All Notes" }}</h2>
            </div>
            <button class="primary-button" @click="createNote">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14m-7-7h14" /></svg>
              New Note
            </button>
          </div>

          <div class="toolbar">
            <div class="filter-tabs" aria-label="Filter notes">
              <button :class="{ 'filter-tabs__item--active': activeFilter === 'all' }" @click="activeFilter = 'all'">All notes</button>
              <button :class="{ 'filter-tabs__item--active': activeFilter === 'recent' }" @click="activeFilter = 'recent'">This week</button>
              <button :class="{ 'filter-tabs__item--active': activeFilter === 'favorites' }" @click="activeFilter = 'favorites'">Favorites</button>
            </div>
            <div class="toolbar__controls">
              <label class="category-filter">
                <span>Category</span>
                <select v-model="activeCategory" aria-label="Filter by category">
                  <option value="">All categories</option>
                  <option v-for="item in NOTE_CATEGORIES" :key="item" :value="item">
                    {{ item }}
                  </option>
                  <option value="__uncategorized__">Uncategorized</option>
                </select>
              </label>
              <label class="sort-control">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M7 12h10m-7 6h4" /></svg>
                <select v-model="sortOption" aria-label="Sort notes">
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="title">Title A–Z</option>
                </select>
              </label>
            </div>
          </div>

          <div v-if="loading" class="notes-grid">
            <div v-for="i in 6" :key="i" class="note-skeleton"></div>
          </div>

          <div v-else-if="errorMessage" class="message-panel message-panel--error">
            <strong>We couldn’t load your notes</strong>
            <p>{{ errorMessage }}</p>
            <button class="primary-button" @click="loadNotes">Try again</button>
          </div>

          <div v-else-if="filteredNotes.length === 0" class="message-panel">
            <span class="empty-icon">✎</span>
            <strong>{{ searchQuery ? "No notes match your search" : activeFilter === "favorites" ? "No favorites yet" : "Your notebook is waiting" }}</strong>
            <p>{{ searchQuery ? "Try searching with another word or phrase." : activeFilter === "favorites" ? "Save a note with the heart button and it will show up here." : "Create your first note and start collecting your ideas." }}</p>
            <button v-if="!searchQuery && activeFilter !== 'favorites'" class="primary-button" @click="createNote">Create your first note</button>
          </div>

          <div v-else class="notes-grid">
            <article v-for="(note, index) in filteredNotes" :key="note.id" class="note-card">
              <div class="note-card__cover" :class="`note-card__cover--${index % 4}`">
                <span class="note-card__cover-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l3 3v15H6zM15 3v4h4M9 12h6m-6 4h4" /></svg>
                </span>
                <time>{{ formatDate(note.createdAt) }}</time>
                <button
                  class="favorite-button"
                  :class="{ 'favorite-button--active': favoriteIds.includes(note.id) }"
                  :aria-label="favoriteIds.includes(note.id) ? 'Remove from favorites' : 'Add to favorites'"
                  @click="toggleFavorite(note.id)"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 20-1.4-1.3C5.6 14.1 2.5 11.3 2.5 7.8A5.2 5.2 0 0 1 7.8 2.5c1.6 0 3.2.8 4.2 2a5.6 5.6 0 0 1 4.2-2 5.2 5.2 0 0 1 5.3 5.3c0 3.5-3.1 6.3-8.1 10.9z" /></svg>
                </button>
              </div>
              <div class="note-card__body">
                <span
                  v-if="note.category"
                  class="category-badge"
                  :class="`category-badge--${getCategoryTone(note.category)}`"
                >{{ note.category }}</span>
                <button class="note-card__title" @click="viewNote(note.id)">{{ note.title }}</button>
                <p>{{ note.content || "No content added yet." }}</p>
                <div class="note-card__footer">
                  <button @click="viewNote(note.id)">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                    View
                  </button>
                  <button @click="editNote(note.id)">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15z" /></svg>
                    Edit
                  </button>
                  <button class="note-card__delete" @click="deleteNote(note.id)">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18m-2 0-.9 14H5.9L5 6m4 0V4h6v2m-5 4v6m4-6v6" /></svg>
                    Delete
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>
        <footer class="page-footer">Made for your thoughts <span>✦</span></footer>
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard {
  --page: #f5f7fb;
  --surface: #fff;
  --surface-soft: #f8faff;
  --ink: #18243a;
  --muted: #7b879b;
  --line: #e8edf5;
  --blue: #2864e8;
  display: flex;
  min-height: 100vh;
  background: var(--page);
  color: var(--ink);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 14px;
  transition: background .2s ease, color .2s ease;
}

.dashboard--dark {
  --page: #111827;
  --surface: #1a2536;
  --surface-soft: #202d40;
  --ink: #edf3ff;
  --muted: #99a8bd;
  --line: #2a384c;
  --blue: #5d8fff;
}

.sidebar {
  position: sticky;
  top: 0;
  display: flex;
  flex: 0 0 246px;
  flex-direction: column;
  height: 100vh;
  padding: 27px 17px 18px;
  background: #14243b;
  color: #dce6f7;
}

.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  margin: 0 7px 42px;
  color: inherit;
  text-decoration: none;
}

.brand__mark {
  display: block;
  width: 39px;
  height: 39px;
  overflow: hidden;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 6px 18px #0c4acb55;
}

.brand__mark img { display: block; width: 100%; height: 100%; object-fit: cover; transform: scale(1.2); }
.brand__copy { display: grid; gap: 2px; }
.brand__copy strong { color: #fff; font-size: 16px; letter-spacing: -.3px; }
.brand__copy small { color: #91a2bd; font-size: 11px; }
.sidebar__label { margin: 0 8px 11px; color: #8292aa; font-size: 9px; font-weight: 750; letter-spacing: 1.2px; }
.side-nav { display: grid; gap: 5px; }

.side-nav__item {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  min-height: 40px;
  padding: 0 10px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: #b9c6d9;
  cursor: pointer;
  text-align: left;
  font: inherit;
  font-size: 12px;
  transition: background .18s ease, color .18s ease;
}

.side-nav__item:hover, .side-nav__item--active { background: #233c64; color: #fff; }
.side-nav__item--active { box-shadow: inset 3px 0 #4b83ff; }
.side-nav__item svg, .icon-button svg, .profile-button__chevron { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.side-nav__count { margin-left: auto; color: #90a3c1; font-size: 10px; }
.sidebar__label--lower { margin-top: 34px; }

.sidebar-tip {
  position: relative;
  overflow: hidden;
  margin-top: 8px;
  padding: 15px 13px 18px;
  border: 1px solid #ffffff13;
  border-radius: 13px;
  background: linear-gradient(145deg, #203b61, #172c49);
}

.sidebar-tip::after {
  position: absolute;
  right: -15px;
  bottom: -34px;
  width: 155px;
  height: 60px;
  border-radius: 50%;
  background: #2864e8;
  content: "";
  opacity: .8;
  transform: rotate(-12deg);
}

.sidebar-tip__sparkle { display: block; margin-bottom: 9px; color: #ffcb4a; font-size: 20px; }
.sidebar-tip strong { font-size: 12px; color: white; }
.sidebar-tip p { position: relative; z-index: 1; max-width: 165px; margin: 5px 0 0; color: #afbdd0; font-size: 10px; line-height: 1.55; }
.sidebar__footer { display: flex; align-items: center; gap: 9px; margin-top: auto; padding: 15px 4px 0; border-top: 1px solid #ffffff16; }
.sidebar__username { overflow: hidden; flex: 1; color: #dce6f7; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.avatar { display: grid; width: 30px; height: 30px; place-items: center; border-radius: 50%; background: #2864e8; color: white; font-size: 12px; font-weight: 700; }
.avatar--small { width: 27px; height: 27px; font-size: 11px; }
.icon-button { display: grid; place-items: center; padding: 7px; border: 0; border-radius: 8px; background: transparent; color: var(--muted); cursor: pointer; }
.sidebar__logout { color: #9eacc0; }
.sidebar__logout:hover { background: #ffffff12; color: white; }

.main-area { min-width: 0; flex: 1; }
.topbar { position: sticky; z-index: 4; top: 0; display: flex; align-items: center; justify-content: space-between; gap: 24px; min-height: 66px; padding: 0 clamp(22px, 4vw, 55px); border-bottom: 1px solid var(--line); background: color-mix(in srgb, var(--surface) 93%, transparent); backdrop-filter: blur(14px); }
.search-box { display: flex; align-items: center; gap: 11px; width: min(480px, 58%); height: 38px; padding: 0 12px; border: 1px solid transparent; border-radius: 9px; background: var(--surface-soft); color: var(--muted); }
.search-box:focus-within { border-color: #a8c3ff; box-shadow: 0 0 0 3px #2864e814; }
.search-box svg, .sort-control svg { width: 16px; height: 16px; flex: 0 0 auto; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.search-box input { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; color: var(--ink); font: inherit; font-size: 11px; }
.search-box input::placeholder { color: #97a2b4; }
.search-box kbd { flex: 0 0 auto; padding: 3px 5px; border: 1px solid var(--line); border-radius: 4px; color: var(--muted); font: inherit; font-size: 9px; }
.topbar__actions { display: flex; align-items: center; gap: 11px; }
.theme-button { width: 32px; height: 32px; border: 1px solid var(--line); background: var(--surface); color: #e9a92f; }
.theme-button:hover { background: var(--surface-soft); }
.profile-button { display: flex; align-items: center; gap: 9px; padding: 3px 0 3px 4px; border: 0; background: transparent; color: var(--ink); cursor: pointer; font: inherit; }
.profile-button__name { max-width: 125px; overflow: hidden; font-size: 11px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.profile-button__chevron { width: 13px; height: 13px; color: var(--muted); }
.dashboard-content { width: min(1260px, 100%); margin: 0 auto; padding: 32px clamp(22px, 4vw, 55px) 22px; }

.welcome-banner { position: relative; display: flex; align-items: center; min-height: 140px; overflow: hidden; padding: 24px 30px; border: 1px solid #d9e5ff; border-radius: 15px; background: linear-gradient(105deg, #edf2ff 0%, #e5edff 57%, #dce9ff 100%); }
.dashboard--dark .welcome-banner { border-color: #31496e; background: linear-gradient(105deg, #202f49, #263b5d); }
.welcome-banner__copy { position: relative; z-index: 2; }
.eyebrow { color: #7183a1; font-size: 9px; font-weight: 750; letter-spacing: 1.15px; }
.welcome-banner h1 { margin: 7px 0 5px; color: #1a2b47; font-size: clamp(19px, 2vw, 25px); font-weight: 760; letter-spacing: -.8px; }
.dashboard--dark .welcome-banner h1 { color: #f1f5ff; }
.welcome-banner p { margin: 0; color: #71819b; font-size: 11px; }
.welcome-art { position: absolute; right: 25%; bottom: 0; width: 165px; height: 119px; }
.welcome-art__paper { position: absolute; bottom: 10px; width: 64px; height: 88px; border-radius: 10px 10px 3px 3px; box-shadow: 0 8px 19px #4671bb30; }
.welcome-art__paper--back { left: 24px; background: #5388fa; transform: rotate(-16deg); }
.welcome-art__paper--front { left: 54px; display: flex; flex-direction: column; gap: 8px; padding: 18px 10px; background: #fff; transform: rotate(1deg); }
.welcome-art__paper--front span { height: 5px; border-radius: 4px; background: #b6cdfc; }
.welcome-art__paper--front span:first-child { width: 36px; height: 8px; background: #7fa5f5; }
.welcome-art__paper--front span:nth-child(2) { width: 44px; }
.welcome-art__paper--front span:nth-child(3) { width: 34px; }
.welcome-art__plant { position: absolute; right: 0; bottom: 10px; width: 38px; height: 47px; }
.welcome-art__plant i { position: absolute; bottom: 5px; left: 15px; width: 17px; height: 30px; border-radius: 100% 0 100% 0; background: #3fca9b; transform: rotate(-26deg); }
.welcome-art__plant i:nth-child(2) { left: 3px; bottom: 2px; transform: rotate(-58deg) scale(.8); background: #26b988; }
.welcome-art__plant i:nth-child(3) { left: 21px; bottom: 0; transform: rotate(18deg) scale(.75); background: #73d9ad; }
.welcome-quote { position: absolute; right: 25px; margin: 0; color: #52647f !important; font-size: 10px !important; font-style: italic; line-height: 1.5; }
.dashboard--dark .welcome-quote { color: #c1cee2 !important; }

.stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 13px; margin-top: 17px; }
.stat-card { display: flex; align-items: center; gap: 11px; min-width: 0; min-height: 72px; padding: 12px; border: 1px solid var(--line); border-radius: 11px; background: var(--surface); box-shadow: 0 4px 12px #25395808; }
.stat-icon { display: grid; width: 36px; height: 36px; flex: 0 0 auto; place-items: center; border-radius: 9px; }
.stat-icon svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.stat-icon--blue { background: #e8efff; color: #3974ee; }
.stat-icon--green { background: #e3f8ef; color: #1cab73; }
.stat-icon--rose { background: #fff0f0; color: #f05e67; }
.stat-icon--purple { background: #f1eaff; color: #9759ed; }
.stat-card__text { display: grid; min-width: 0; gap: 2px; }
.stat-card__text strong { font-size: 17px; line-height: 1.1; }
.stat-card__text small { overflow: hidden; color: var(--muted); font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
.stat-card__meta { margin-left: auto; color: #a1abba; font-size: 9px; white-space: nowrap; }
.stat-card__meta--green { color: #1aaa72; }
.notes-section { margin-top: 32px; }
.notes-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.notes-heading h2 { margin: 4px 0 0; font-size: 20px; font-weight: 740; letter-spacing: -.5px; }
.primary-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 37px; padding: 0 15px; border: 0; border-radius: 8px; background: #2864e8; color: #fff; cursor: pointer; font: inherit; font-size: 11px; font-weight: 650; box-shadow: 0 5px 12px #2864e82b; transition: background .18s ease, transform .18s ease; }
.primary-button:hover { background: #1e56d2; transform: translateY(-1px); }
.primary-button svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; }
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin: 20px 0 14px; }
.toolbar__controls { display: flex; align-items: center; gap: 8px; }
.filter-tabs { display: flex; align-items: center; gap: 5px; }
.filter-tabs button { padding: 7px 12px; border: 0; border-radius: 7px; background: transparent; color: var(--muted); cursor: pointer; font: inherit; font-size: 10px; font-weight: 600; }
.filter-tabs button:hover { background: var(--surface-soft); color: var(--ink); }
.filter-tabs .filter-tabs__item--active { background: #eaf0ff; color: #2864e8; }
.dashboard--dark .filter-tabs .filter-tabs__item--active { background: #263c62; color: #8fb0ff; }
.sort-control { display: flex; align-items: center; gap: 7px; padding: 7px 10px; border: 1px solid var(--line); border-radius: 7px; background: var(--surface); color: var(--muted); }
.sort-control svg { width: 14px; height: 14px; }
.sort-control select { max-width: 115px; border: 0; outline: 0; background: transparent; color: var(--ink); font: inherit; font-size: 10px; cursor: pointer; }
.category-filter { display: flex; align-items: center; gap: 7px; padding: 7px 10px; border: 1px solid var(--line); border-radius: 7px; background: var(--surface); color: var(--muted); font-size: 10px; }
.category-filter select { max-width: 130px; border: 0; outline: 0; background: transparent; color: var(--ink); font: inherit; cursor: pointer; }

.notes-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 15px; }
.note-card { min-width: 0; overflow: hidden; border: 1px solid var(--line); border-radius: 11px; background: var(--surface); box-shadow: 0 4px 14px #25395808; transition: transform .2s ease, box-shadow .2s ease; }
.note-card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px #25395816; }
.note-card__cover { position: relative; display: flex; align-items: flex-start; justify-content: space-between; min-height: 90px; padding: 13px; }
.note-card__cover--0 { background: linear-gradient(130deg, #eaf0ff, #dbe7ff); }
.note-card__cover--1 { background: linear-gradient(130deg, #e2f6ed, #cceede); }
.note-card__cover--2 { background: linear-gradient(130deg, #fff0e6, #ffe1d1); }
.note-card__cover--3 { background: linear-gradient(130deg, #f2eaff, #e4d7ff); }
.note-card__cover-icon { display: grid; width: 30px; height: 30px; place-items: center; border-radius: 8px; background: #ffffffb8; color: #3974ee; }
.note-card__cover--1 .note-card__cover-icon { color: #1cab73; }
.note-card__cover--2 .note-card__cover-icon { color: #f07d4e; }
.note-card__cover--3 .note-card__cover-icon { color: #9759ed; }
.note-card__cover-icon svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.note-card__cover time { margin: 8px auto 0 9px; color: #566984; font-size: 9px; }
.favorite-button { display: grid; width: 28px; height: 28px; place-items: center; border: 0; border-radius: 50%; background: #ffffffa8; color: #77859a; cursor: pointer; }
.favorite-button:hover, .favorite-button--active { color: #ee6470; }
.favorite-button svg { width: 14px; height: 14px; fill: transparent; stroke: currentColor; stroke-width: 1.8; }
.favorite-button--active svg { fill: currentColor; }
.note-card__body { padding: 13px 14px 11px; }
.category-badge, .note-category { display: inline-flex; align-items: center; width: fit-content; padding: 4px 8px; border-radius: 999px; font-size: 9px; font-weight: 700; line-height: 1.2; }
.category-badge { margin-bottom: 8px; }
.category-badge--blue { background: #e8efff; color: #2864e8; }
.category-badge--green { background: #e3f8ef; color: #168b5c; }
.category-badge--rose { background: #fff0f0; color: #d44f5a; }
.category-badge--purple { background: #f1eaff; color: #8348d6; }
.category-badge--amber { background: #fff5dc; color: #a66a08; }
.note-card__title { display: block; width: 100%; overflow: hidden; padding: 0; border: 0; background: transparent; color: var(--ink); cursor: pointer; font: inherit; font-size: 13px; font-weight: 700; text-align: left; text-overflow: ellipsis; white-space: nowrap; }
.note-card__title:hover { color: var(--blue); }
.note-card__body > p { display: -webkit-box; min-height: 38px; overflow: hidden; margin: 7px 0 12px; color: var(--muted); font-size: 10px; line-height: 1.55; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.note-card__footer { display: flex; align-items: center; gap: 4px; padding-top: 9px; border-top: 1px solid var(--line); }
.note-card__footer button { display: inline-flex; align-items: center; gap: 4px; padding: 4px 5px; border: 0; border-radius: 5px; background: transparent; color: var(--muted); cursor: pointer; font: inherit; font-size: 9px; font-weight: 600; }
.note-card__footer button:hover { background: var(--surface-soft); color: var(--blue); }
.note-card__footer svg { width: 12px; height: 12px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.note-card__footer .note-card__delete { margin-left: auto; color: #ed626d; }
.note-card__footer .note-card__delete:hover { background: #fff0f1; color: #d83f4b; }
.message-panel { display: grid; justify-items: center; gap: 9px; min-height: 230px; align-content: center; padding: 25px; border: 1px dashed var(--line); border-radius: 12px; background: var(--surface); text-align: center; }
.message-panel > strong { font-size: 14px; }
.message-panel p { margin: 0 0 5px; color: var(--muted); font-size: 11px; }
.message-panel--error { border-color: #f3c4c7; background: #fff8f8; }
.dashboard--dark .message-panel--error { background: #3a2228; }
.message-panel--error > strong { color: #d6424d; }
.empty-icon { display: grid; width: 38px; height: 38px; place-items: center; margin-bottom: 3px; border-radius: 11px; background: var(--surface-soft); color: var(--blue); font-size: 22px; }
.note-skeleton { height: 230px; border-radius: 11px; background: linear-gradient(100deg, var(--surface) 20%, var(--surface-soft) 40%, var(--surface) 60%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
@keyframes shimmer { to { background-position-x: -200%; } }
.page-footer { padding-top: 25px; color: #a0a9b7; font-size: 9px; text-align: center; }
.page-footer span { color: #f4b735; }

@media (max-width: 1050px) {
  .sidebar { flex-basis: 210px; }
  .stat-card { gap: 8px; padding: 10px; }
  .stat-card__meta { display: none; }
  .welcome-art { right: 24%; }
}

@media (max-width: 800px) {
  .toolbar { align-items: flex-start; flex-direction: column; }
  .toolbar__controls { width: 100%; justify-content: space-between; }
  .category-filter { flex: 1; }
  .category-filter select { min-width: 0; }
  .sidebar { flex-basis: 67px; align-items: center; padding: 18px 9px 13px; }
  .brand { margin: 0 0 32px; }
  .brand__copy, .sidebar__label, .side-nav__item span, .sidebar-tip, .sidebar__username, .sidebar__logout { display: none; }
  .side-nav { width: 100%; }
  .side-nav__item { justify-content: center; padding: 0; }
  .side-nav__item svg { width: 18px; height: 18px; }
  .sidebar__footer { justify-content: center; width: 100%; padding-top: 12px; }
  .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .notes-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .welcome-art { right: 25%; opacity: .8; }
  .welcome-quote { display: none; }
}

@media (max-width: 560px) {
  .sidebar { position: static; flex: 0 0 54px; height: auto; min-height: 100vh; padding: 15px 6px 10px; }
  .brand { margin-bottom: 24px; }
  .brand__mark { width: 35px; height: 35px; }
  .side-nav__item { min-height: 37px; }
  .topbar { min-height: 58px; gap: 8px; padding: 0 12px; }
  .search-box { width: 100%; height: 34px; gap: 7px; padding: 0 8px; }
  .search-box kbd { display: none; }
  .search-box input { font-size: 10px; }
  .topbar__actions { gap: 4px; }
  .profile-button__name, .profile-button__chevron { display: none; }
  .profile-button .avatar { width: 27px; height: 27px; }
  .dashboard-content { padding: 18px 12px; }
  .welcome-banner { min-height: 130px; padding: 19px 17px; }
  .welcome-banner h1 { max-width: 235px; font-size: 19px; }
  .welcome-banner p { max-width: 220px; font-size: 10px; line-height: 1.5; }
  .welcome-art { right: -15px; bottom: -8px; opacity: .4; transform: scale(.78); transform-origin: bottom right; }
  .stats-grid { gap: 8px; margin-top: 11px; }
  .stat-card { min-height: 63px; gap: 8px; padding: 8px; }
  .stat-icon { width: 30px; height: 30px; }
  .stat-icon svg { width: 15px; height: 15px; }
  .stat-card__text strong { font-size: 15px; }
  .stat-card__text small { font-size: 8px; }
  .notes-section { margin-top: 25px; }
  .notes-heading h2 { font-size: 18px; }
  .primary-button { min-height: 34px; padding: 0 10px; font-size: 10px; }
  .toolbar { align-items: flex-start; flex-direction: column; gap: 10px; margin: 15px 0 12px; }
  .filter-tabs { max-width: 100%; overflow-x: auto; }
  .filter-tabs button { padding: 7px 9px; white-space: nowrap; }
  .sort-control { align-self: flex-end; }
  .notes-grid { grid-template-columns: 1fr; gap: 11px; }
  .note-card__cover { min-height: 74px; }
  .note-card__body > p { min-height: unset; }
}
</style>
