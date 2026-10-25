<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../services/api";
import { renderMarkdown } from "../utils/markdown";
import {
  getCategoryTone,
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

const route = useRoute();
const router = useRouter();
const note = ref<Note | null>(null);
const loading = ref(true);
const deleting = ref(false);
const errorMessage = ref("");
const isDark = ref(false);
const userName = ref("there");

const loadPreferences = () => {
  isDark.value = localStorage.getItem("theme") === "dark";

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

const loadNote = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const id = Number(route.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      errorMessage.value = "Invalid note ID.";
      return;
    }

    const response = await api.get<Note>(`/Notes/${id}`);
    note.value = {
      ...response.data,
      category:
        response.data.category ||
        readSavedNoteCategories()[String(response.data.id)] ||
        null,
    };
  } catch (error: any) {
    console.error(error);
    errorMessage.value =
      error?.response?.data?.message || "Failed to load this note.";
  } finally {
    loading.value = false;
  }
};

const goBack = () => router.push("/notes");

const goEdit = () => {
  if (note.value) {
    router.push(`/notes/${note.value.id}/edit`);
  }
};

const deleteNote = async () => {
  if (!note.value) return;

  if (!window.confirm("Are you sure you want to delete this note?")) return;

  deleting.value = true;

  try {
    await api.delete(`/Notes/${note.value.id}`);
    saveNoteCategory(note.value.id, "");
    router.push("/notes");
  } catch (error: any) {
    console.error(error);
    window.alert(
      error?.response?.data?.message || "Failed to delete note.",
    );
  } finally {
    deleting.value = false;
  }
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  router.push("/login");
};

const formatDate = (date: string) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Not available";

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatFullDate = (date: string) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Not available";

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

onMounted(() => {
  loadPreferences();
  loadNote();
});
</script>

<template>
  <div class="details-page" :class="{ 'details-page--dark': isDark }">
    <aside class="sidebar">
      <a class="brand" href="#/notes" aria-label="NoteMe home">
        <span class="brand__mark"><img :src="logoUrl" alt="" /></span>
        <span class="brand__copy">
          <strong>NoteMe</strong>
          <small>Your personal notes</small>
        </span>
      </a>

      <div class="sidebar__label">WORKSPACE</div>
      <nav class="side-nav" aria-label="Workspace">
        <button class="side-nav__item side-nav__item--active" @click="goBack">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1z" /></svg>
          <span>My Notes</span>
        </button>
        <button class="side-nav__item" @click="router.push('/notes/create')">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14m-7-7h14" /></svg>
          <span>New Note</span>
        </button>
      </nav>

      <div class="sidebar-tip">
        <span class="sidebar-tip__crown">♛</span>
        <strong>Stay organized</strong>
        <p>Keep your thoughts in one place and find them whenever you need.</p>
        <span class="sidebar-tip__wave"></span>
      </div>

      <div class="sidebar__footer">
        <span class="avatar avatar--small">{{ userName.charAt(0).toUpperCase() }}</span>
        <span class="sidebar__username">{{ userName }}</span>
        <button
          class="icon-button sidebar__logout"
          aria-label="Log out"
          title="Log out"
          @click="logout"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17l5-5-5-5M15 12H3m9-8h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7" /></svg>
        </button>
      </div>
    </aside>

    <main class="main-area">
      <header class="topbar">
        <button class="search-button" type="button" aria-label="Back to note search" @click="goBack">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
          <span>Search notes by title or content...</span>
          <kbd>Ctrl</kbd><kbd>K</kbd>
        </button>
        <div class="topbar__actions">
          <button
            class="theme-toggle"
            :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
            @click="toggleTheme"
          >
            <span :class="{ 'theme-toggle__active': !isDark }" aria-hidden="true">☼</span>
            <span :class="{ 'theme-toggle__active': isDark }" aria-hidden="true">☾</span>
          </button>
          <button class="profile-button" title="Log out" @click="logout">
            <span class="avatar">{{ userName.charAt(0).toUpperCase() }}</span>
            <span class="profile-button__name">{{ userName }}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5" /></svg>
          </button>
        </div>
      </header>

      <div class="page-content">
        <button class="back-link" @click="goBack">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6M9 12h12" /></svg>
          Back to Notes
        </button>

        <div v-if="loading" class="state-card" role="status">
          <span class="loading-spinner"></span>
          <strong>Loading your note...</strong>
          <p>Getting everything ready for you.</p>
        </div>

        <div v-else-if="errorMessage" class="state-card state-card--error">
          <span class="state-card__icon">!</span>
          <strong>Unable to load note</strong>
          <p>{{ errorMessage }}</p>
          <button class="primary-button" @click="loadNote">Try again</button>
        </div>

        <template v-else-if="note">
          <section class="note-heading">
            <div class="heading-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l3 3v15H6zM15 3v4h4M9 12h6m-6 4h6" /></svg>
            </div>
            <div class="note-heading__copy">
              <span class="eyebrow">YOUR NOTE</span>
              <span
                v-if="note.category"
                class="note-category"
                :class="`category-badge--${getCategoryTone(note.category)}`"
              >{{ note.category }}</span>
              <h1>{{ note.title }}</h1>
              <p>Created {{ formatDate(note.createdAt) }}</p>
            </div>
          </section>

          <article class="note-card">
            <div class="note-content">
              <div
                v-if="note.content"
                class="note-content__text"
                v-html="renderMarkdown(note.content)"
              ></div>
              <div v-else class="empty-content">
                <span class="empty-content__icon">✎</span>
                <strong>This note is ready for your ideas</strong>
                <p>There’s no content here yet. Edit the note to add your thoughts.</p>
              </div>
            </div>

            <footer class="note-actions">
              <span class="note-actions__hint">Keep your thoughts up to date</span>
              <div class="note-actions__buttons">
                <button class="edit-button" @click="goEdit">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15z" /></svg>
                  Edit Note
                </button>
                <button class="delete-button" :disabled="deleting" @click="deleteNote">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18m-2 0-.9 14H5.9L5 6m4 0V4h6v2m-5 4v6m4-6v6" /></svg>
                  {{ deleting ? "Deleting..." : "Delete Note" }}
                </button>
              </div>
            </footer>
          </article>

          <section class="note-meta" aria-label="Note dates">
            <div class="note-meta__item">
              <span class="meta-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>
              </span>
              <span><small>Created</small><strong>{{ formatFullDate(note.createdAt) }}</strong></span>
            </div>
            <div class="note-meta__item">
              <span class="meta-icon meta-icon--purple">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15z" /></svg>
              </span>
              <span><small>Last modified</small><strong>{{ formatFullDate(note.updatedAt) }}</strong></span>
            </div>
          </section>
        </template>
        <footer class="page-footer">Made for your thoughts <span>✦</span></footer>
      </div>
    </main>
  </div>
</template>

<style scoped>
.details-page {
  --page: #f4f7fc;
  --surface: #fff;
  --surface-soft: #f7faff;
  --ink: #18243a;
  --muted: #7b879b;
  --line: #e5ebf4;
  --blue: #2864e8;
  display: flex;
  min-height: 100vh;
  background: var(--page);
  color: var(--ink);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 14px;
}

.details-page--dark { --page: #111827; --surface: #1a2536; --surface-soft: #202d40; --ink: #edf3ff; --muted: #99a8bd; --line: #2a384c; --blue: #5d8fff; }
.sidebar { position: sticky; top: 0; display: flex; flex: 0 0 218px; flex-direction: column; height: 100vh; padding: 20px 14px 15px; background: #14243b; color: #dce6f7; }
.brand { display: flex; align-items: center; gap: 11px; margin: 0 6px 36px; color: inherit; text-decoration: none; }
.brand__mark { display: block; width: 39px; height: 39px; flex: 0 0 auto; overflow: hidden; border-radius: 11px; background: #fff; box-shadow: 0 6px 18px #0c4acb55; }
.brand__mark img { display: block; width: 100%; height: 100%; object-fit: cover; transform: scale(1.2); }
.brand__copy { display: grid; gap: 2px; }
.brand__copy strong { color: #fff; font-size: 16px; }
.brand__copy small { color: #91a2bd; font-size: 11px; }
.sidebar__label { margin: 0 8px 10px; color: #8292aa; font-size: 9px; font-weight: 750; letter-spacing: 1.1px; }
.side-nav { display: grid; gap: 5px; }
.side-nav__item { display: flex; align-items: center; gap: 10px; width: 100%; min-height: 40px; padding: 0 10px; border: 0; border-radius: 8px; background: transparent; color: #b9c6d9; cursor: pointer; text-align: left; font: inherit; font-size: 11px; }
.side-nav__item:hover, .side-nav__item--active { background: #233c64; color: white; }
.side-nav__item--active { box-shadow: inset 3px 0 #4b83ff; }
.side-nav__item svg, .icon-button svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.sidebar-tip { position: relative; overflow: hidden; margin-top: auto; padding: 16px 13px 21px; border: 1px solid #ffffff13; border-radius: 12px; background: linear-gradient(145deg, #203b61, #172c49); }
.sidebar-tip__crown { display: block; margin-bottom: 8px; color: #ffcc45; font-size: 21px; }
.sidebar-tip strong { color: white; font-size: 12px; }
.sidebar-tip p { position: relative; z-index: 1; margin: 6px 0 0; color: #afbdd0; font-size: 10px; line-height: 1.55; }
.sidebar-tip__wave { position: absolute; right: -17px; bottom: -33px; width: 170px; height: 61px; border-radius: 50%; background: #2864e8; transform: rotate(-15deg); }
.sidebar__footer { display: flex; align-items: center; gap: 9px; margin-top: 14px; padding: 12px 4px 0; border-top: 1px solid #ffffff16; }
.sidebar__username { overflow: hidden; flex: 1; color: #dce6f7; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.avatar { display: grid; width: 30px; height: 30px; flex: 0 0 auto; place-items: center; border-radius: 50%; background: #2864e8; color: white; font-size: 12px; font-weight: 700; }
.avatar--small { width: 27px; height: 27px; font-size: 11px; }
.icon-button { display: grid; place-items: center; padding: 7px; border: 0; border-radius: 8px; background: transparent; color: var(--muted); cursor: pointer; }
.sidebar__logout { color: #9eacc0; }
.sidebar__logout:hover { background: #ffffff12; color: white; }
.main-area { min-width: 0; flex: 1; }
.topbar { position: sticky; z-index: 5; top: 0; display: flex; align-items: center; justify-content: space-between; gap: 24px; min-height: 60px; padding: 0 clamp(20px, 3vw, 38px); border-bottom: 1px solid var(--line); background: color-mix(in srgb, var(--surface) 94%, transparent); backdrop-filter: blur(14px); }
.search-button { display: flex; align-items: center; gap: 10px; width: min(540px, 62%); height: 36px; padding: 0 11px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface-soft); color: #8492a8; cursor: pointer; text-align: left; font: inherit; font-size: 10px; }
.search-button:hover { border-color: #b6caff; }
.search-button > svg { width: 16px; height: 16px; flex: 0 0 auto; fill: none; stroke: currentColor; stroke-width: 1.8; }
.search-button span { flex: 1; }
.search-button kbd { padding: 3px 5px; border: 1px solid var(--line); border-radius: 4px; font: inherit; font-size: 8px; }
.topbar__actions { display: flex; align-items: center; gap: 22px; }
.theme-toggle { display: flex; align-items: center; gap: 3px; padding: 3px; border: 1px solid var(--line); border-radius: 18px; background: var(--surface-soft); color: var(--muted); cursor: pointer; }
.theme-toggle span { display: grid; width: 22px; height: 22px; place-items: center; border-radius: 50%; font-size: 14px; }
.theme-toggle .theme-toggle__active { background: var(--surface); color: #e6a526; box-shadow: 0 1px 4px #162c4c20; }
.profile-button { display: flex; align-items: center; gap: 8px; padding: 0; border: 0; background: transparent; color: var(--ink); cursor: pointer; font: inherit; }
.profile-button__name { max-width: 120px; overflow: hidden; font-size: 10px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.profile-button > svg { width: 13px; height: 13px; fill: none; stroke: var(--muted); stroke-width: 1.8; }
.page-content { width: min(1120px, 100%); margin: 0 auto; padding: 23px clamp(20px, 4vw, 54px) 25px; }
.back-link { display: inline-flex; align-items: center; gap: 7px; margin-bottom: 20px; padding: 0; border: 0; background: transparent; color: #2164e8; cursor: pointer; font: inherit; font-size: 11px; font-weight: 600; }
.back-link:hover { color: #164bb4; }
.back-link svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.note-heading { position: relative; display: flex; align-items: center; gap: 15px; min-height: 86px; margin-bottom: 16px; }
.heading-icon { display: grid; width: 52px; height: 52px; flex: 0 0 auto; place-items: center; border-radius: 13px; background: #e6efff; color: #3474ed; }
.details-page--dark .heading-icon { background: #263d63; color: #8db1ff; }
.heading-icon svg { width: 25px; height: 25px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.note-heading__copy { min-width: 0; }
.eyebrow { color: #8392aa; font-size: 8px; font-weight: 750; letter-spacing: 1px; }
.note-category { display: inline-flex; align-items: center; width: fit-content; margin-top: 5px; padding: 4px 8px; border-radius: 999px; font-size: 9px; font-weight: 700; line-height: 1.2; }
.category-badge--blue { background: #e8efff; color: #2864e8; }
.category-badge--green { background: #e3f8ef; color: #168b5c; }
.category-badge--rose { background: #fff0f0; color: #d44f5a; }
.category-badge--purple { background: #f1eaff; color: #8348d6; }
.category-badge--amber { background: #fff5dc; color: #a66a08; }
.note-heading h1 { overflow-wrap: anywhere; margin: 3px 0 5px; color: var(--ink); font-size: clamp(21px, 2.5vw, 29px); font-weight: 760; letter-spacing: -.8px; line-height: 1.2; }
.note-heading p { margin: 0; color: var(--muted); font-size: 10px; }
.note-card { overflow: hidden; border: 1px solid var(--line); border-radius: 13px; background: var(--surface); box-shadow: 0 5px 20px #2539580b; }
.note-content { min-height: 250px; padding: clamp(20px, 3vw, 34px); }
.note-content__text { color: var(--ink); font-size: 13px; line-height: 1.85; overflow-wrap: anywhere; }
.note-content__text :deep(p) { margin: 0 0 12px; }
.note-content__text :deep(p:last-child) { margin-bottom: 0; }
.note-content__text :deep(ul), .note-content__text :deep(ol) { margin: 0 0 12px; padding-left: 24px; }
.note-content__text :deep(li + li) { margin-top: 4px; }
.note-content__text :deep(a) { color: var(--blue); text-decoration: underline; overflow-wrap: anywhere; }
.note-content__text :deep(code), .note-content__text :deep(pre) { border-radius: 6px; background: var(--surface-soft); font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
.note-content__text :deep(code) { padding: 2px 5px; }
.note-content__text :deep(pre) { overflow-x: auto; margin: 12px 0; padding: 13px; border: 1px solid var(--line); }
.note-content__text :deep(pre code) { padding: 0; background: transparent; }
.empty-content { display: grid; min-height: 190px; place-content: center; justify-items: center; text-align: center; }
.empty-content__icon { display: grid; width: 40px; height: 40px; place-items: center; margin-bottom: 12px; border-radius: 12px; background: #eaf1ff; color: #2864e8; font-size: 23px; }
.empty-content strong { color: var(--ink); font-size: 13px; }
.empty-content p { margin: 6px 0 0; color: var(--muted); font-size: 10px; }
.note-actions { display: flex; align-items: center; justify-content: space-between; gap: 14px; min-height: 71px; padding: 14px 20px; border-top: 1px solid var(--line); background: var(--surface-soft); }
.note-actions__hint { color: var(--muted); font-size: 10px; }
.note-actions__buttons { display: flex; gap: 9px; }
.edit-button, .delete-button, .primary-button { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 37px; padding: 0 14px; border-radius: 8px; cursor: pointer; font: inherit; font-size: 10px; font-weight: 650; transition: background .18s ease, transform .18s ease; }
.edit-button, .primary-button { border: 0; background: #2864e8; color: #fff; box-shadow: 0 5px 12px #2864e82b; }
.edit-button:hover, .primary-button:hover { background: #1e56d2; transform: translateY(-1px); }
.delete-button { border: 1px solid #f0c9cc; background: var(--surface); color: #db5964; }
.delete-button:hover:not(:disabled) { background: #fff1f2; }
.delete-button:disabled { cursor: wait; opacity: .6; }
.edit-button svg, .delete-button svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.note-meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 13px; }
.note-meta__item { display: flex; align-items: center; gap: 10px; min-width: 0; padding: 13px; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); }
.meta-icon { display: grid; width: 32px; height: 32px; flex: 0 0 auto; place-items: center; border-radius: 9px; background: #eaf1ff; color: #3574ed; }
.meta-icon--purple { background: #f2eaff; color: #8a50eb; }
.meta-icon svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.note-meta__item > span:last-child { display: grid; min-width: 0; gap: 3px; }
.note-meta small { color: var(--muted); font-size: 9px; }
.note-meta strong { overflow-wrap: anywhere; color: var(--ink); font-size: 9px; font-weight: 600; }
.state-card { display: grid; justify-items: center; gap: 8px; min-height: 280px; align-content: center; padding: 25px; border: 1px solid var(--line); border-radius: 12px; background: var(--surface); text-align: center; box-shadow: 0 4px 15px #25395809; }
.state-card > strong { color: var(--ink); font-size: 14px; }
.state-card > p { margin: 0; color: var(--muted); font-size: 11px; }
.loading-spinner { width: 26px; height: 26px; margin-bottom: 5px; border: 3px solid var(--line); border-top-color: var(--blue); border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.state-card__icon { display: grid; width: 32px; height: 32px; place-items: center; border-radius: 50%; background: #fff0f0; color: #c43e48; font-weight: 800; }
.state-card--error { border-color: #f1c7ca; }
.state-card--error > strong { color: #c43e48; }
.state-card .primary-button { margin-top: 5px; }
.page-footer { padding-top: 20px; color: #a0a9b7; font-size: 9px; text-align: center; }
.page-footer span { color: #f4b735; }

@media (max-width: 950px) {
  .sidebar { flex-basis: 190px; }
  .note-actions__hint { display: none; }
}
@media (max-width: 760px) {
  .sidebar { flex-basis: 62px; align-items: center; padding: 16px 7px 12px; }
  .brand { margin: 0 0 27px; }
  .brand__copy, .sidebar__label, .side-nav__item span, .sidebar-tip, .sidebar__username, .sidebar__logout { display: none; }
  .side-nav { width: 100%; }
  .side-nav__item { justify-content: center; padding: 0; }
  .side-nav__item svg { width: 18px; height: 18px; }
  .sidebar__footer { justify-content: center; width: 100%; padding-top: 10px; }
  .topbar { gap: 10px; padding: 0 13px; }
  .topbar__actions { gap: 9px; }
  .page-content { padding: 18px 16px 22px; }
}
@media (max-width: 560px) {
  .sidebar { flex-basis: 52px; padding: 13px 5px 10px; }
  .brand { margin-bottom: 22px; }
  .brand__mark { width: 35px; height: 35px; }
  .topbar { min-height: 54px; gap: 8px; padding: 0 10px; }
  .search-button { width: 100%; height: 33px; gap: 6px; padding: 0 8px; font-size: 9px; }
  .search-button kbd { display: none; }
  .topbar__actions { gap: 5px; }
  .profile-button__name, .profile-button > svg { display: none; }
  .avatar { width: 27px; height: 27px; }
  .page-content { padding: 15px 12px 20px; }
  .back-link { margin-bottom: 14px; }
  .note-heading { gap: 11px; min-height: 71px; margin-bottom: 11px; }
  .heading-icon { width: 43px; height: 43px; border-radius: 11px; }
  .heading-icon svg { width: 21px; height: 21px; }
  .note-heading h1 { font-size: 21px; }
  .note-content { min-height: 210px; padding: 20px 16px; }
  .note-content__text { font-size: 12px; line-height: 1.75; }
  .note-actions { align-items: stretch; padding: 12px; }
  .note-actions__buttons { width: 100%; }
  .edit-button, .delete-button { flex: 1; padding: 0 8px; }
  .note-meta { grid-template-columns: 1fr; gap: 8px; }
}
@media (max-width: 360px) {
  .search-button span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .note-heading h1 { font-size: 19px; }
  .note-actions__buttons { flex-direction: column; }
}
</style>
