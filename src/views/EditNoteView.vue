<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import MarkdownEditor from "../components/MarkdownEditor.vue";
import api from "../services/api";
import { renderMarkdown } from "../utils/markdown";
import {
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
  createdAt?: string;
  updatedAt?: string;
}

const route = useRoute();
const router = useRouter();

const title = ref("");
const content = ref("");
const contentCharacterCount = ref(0);
const category = ref("");
const note = ref<Note | null>(null);
const loadingNote = ref(true);
const saving = ref(false);
const loadError = ref("");
const errorMessage = ref("");
const successMessage = ref("");
const isDark = ref(false);
const userName = ref("there");

const previewTitle = computed(() => title.value.trim() || "Note Title");
const previewContentHtml = computed(() => renderMarkdown(content.value));

const formatDate = (date?: string) => {
  if (!date) return "Not available";
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
  loadingNote.value = true;
  loadError.value = "";

  try {
    const id = Number(route.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      loadError.value = "Invalid note ID.";
      return;
    }

    const response = await api.get<Note>(`/Notes/${id}`);
    note.value = response.data;
    title.value = response.data.title ?? "";
    content.value = response.data.content ?? "";
    category.value =
      response.data.category ||
      readSavedNoteCategories()[String(response.data.id)] ||
      "";
  } catch (error: any) {
    console.error(error);
    loadError.value =
      error?.response?.data?.message || "Failed to load this note.";
  } finally {
    loadingNote.value = false;
  }
};

const updateNote = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  if (!title.value.trim()) {
    errorMessage.value = "Please enter a note title.";
    return;
  }

  const id = Number(route.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    errorMessage.value = "Invalid note ID.";
    return;
  }

  saving.value = true;

  try {
    await api.put(`/Notes/${id}`, {
      title: title.value.trim(),
      content: content.value.trim() || null,
      category: category.value || null,
    });

    const categorySaved = saveNoteCategory(id, category.value);
    if (!categorySaved && category.value) {
      errorMessage.value =
        "Your note was updated, but its category could not be saved in this browser.";
      return;
    }

    successMessage.value = "Note updated successfully.";
    setTimeout(() => {
      router.push(`/notes/${id}`);
    }, 500);
  } catch (error: any) {
    console.error(error);
    errorMessage.value =
      error?.response?.data?.message || "Failed to update note.";
  } finally {
    saving.value = false;
  }
};

const goBack = () => {
  const id = Number(route.params.id);
  if (Number.isInteger(id) && id > 0) {
    router.push(`/notes/${id}`);
  } else {
    router.push("/notes");
  }
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  router.push("/login");
};

onMounted(() => {
  loadPreferences();
  loadNote();
});
</script>

<template>
  <div class="edit-page" :class="{ 'edit-page--dark': isDark }">
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
        <button class="icon-button sidebar__logout" aria-label="Log out" title="Log out" @click="logout">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17l5-5-5-5M15 12H3m9-8h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7" /></svg>
        </button>
      </div>
    </aside>

    <main class="main-area">
      <header class="topbar">
        <button class="search-button" type="button" aria-label="Go to note search" @click="router.push('/notes')">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
          <span>Search notes by title or content...</span>
          <kbd>Ctrl</kbd><kbd>K</kbd>
        </button>
        <div class="topbar__actions">
          <button class="theme-toggle" :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'" @click="toggleTheme">
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

        <section class="page-heading">
          <div class="heading-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15z" /></svg>
          </div>
          <div>
            <span class="eyebrow">REFINE YOUR THOUGHTS</span>
            <h1>Edit Your Note</h1>
            <p>Update your note in <strong>NoteMe</strong></p>
          </div>
          <div class="heading-art" aria-hidden="true">
            <span class="art-leaf art-leaf--one"></span>
            <span class="art-leaf art-leaf--two"></span>
            <span class="art-leaf art-leaf--three"></span>
            <div class="art-notebook">
              <span></span><span></span><span></span>
            </div>
            <span class="art-pen"></span>
            <span class="art-spark">✦</span>
          </div>
        </section>

        <div v-if="loadingNote" class="state-card" role="status">
          <span class="loading-spinner"></span>
          <strong>Loading your note...</strong>
          <p>Getting everything ready for you.</p>
        </div>

        <div v-else-if="loadError" class="state-card state-card--error">
          <span class="state-card__icon">!</span>
          <strong>Unable to load note</strong>
          <p>{{ loadError }}</p>
          <button class="save-button state-card__retry" @click="loadNote">Try again</button>
        </div>

        <div v-else class="editor-layout">
          <section class="editor-card">
            <div v-if="errorMessage" class="form-message form-message--error" role="alert">
              {{ errorMessage }}
            </div>
            <div v-if="successMessage" class="form-message form-message--success" role="status">
              {{ successMessage }}
            </div>

            <form class="note-form" @submit.prevent="updateNote">
              <div class="field-heading">
                <label for="title">Title</label>
                <span>Required</span>
              </div>
              <div class="title-input">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l3 3v15H6zM15 3v4h4" /></svg>
                <input
                  id="title"
                  v-model="title"
                  type="text"
                  maxlength="200"
                  autocomplete="off"
                  placeholder="Enter a descriptive title for your note..."
                  required
                />
              </div>
              <div class="character-count">{{ title.length }} / 200</div>

              <div class="category-field">
                <div class="field-heading">
                  <label for="category">Category</label>
                  <span>Optional</span>
                </div>
                <select id="category" v-model="category">
                  <option value="">No category</option>
                  <option v-for="item in NOTE_CATEGORIES" :key="item" :value="item">
                    {{ item }}
                  </option>
                </select>
              </div>

              <div class="content-heading">
                <div class="field-heading">
                  <label for="content">Content</label>
                  <span>Optional</span>
                </div>
              </div>
              <MarkdownEditor
                id="content"
                v-model="content"
                :maxlength="10000"
                @character-count="contentCharacterCount = $event"
              />
              <p class="editor-hint">Formatting is saved with your note.</p>
              <div class="character-count character-count--content">{{ contentCharacterCount }} / 10,000</div>

              <div class="form-actions">
                <button class="cancel-button" type="button" @click="goBack">Cancel</button>
                <button class="save-button" type="submit" :disabled="saving || !title.trim()">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h12l4 4v14H3V3zm3 0v6h9V3m-9 18v-8h10v8" /></svg>
                  {{ saving ? "Saving Changes..." : "Save Changes" }}
                </button>
              </div>
            </form>
          </section>

          <aside class="helper-column">
            <section class="helper-card tips-card">
              <header class="helper-card__heading">
                <span class="helper-icon helper-icon--blue">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6m-5 4h4m-2-20a7 7 0 0 0-4 12.7c.7.5 1 1.2 1 2.3h6c0-1.1.3-1.8 1-2.3A7 7 0 0 0 12 2Z" /></svg>
                </span>
                <strong>Tips for Editing</strong>
              </header>
              <ul class="tips-list">
                <li>Keep your title clear and descriptive</li>
                <li>Update your content to keep it organized</li>
                <li>Use line breaks to improve readability</li>
                <li>Save your changes when you’re done</li>
              </ul>
            </section>

            <section class="helper-card info-card">
              <header class="helper-card__heading">
                <span class="helper-icon helper-icon--purple">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 11v5m0-8h.01" /></svg>
                </span>
                <span><strong>Note Information</strong><small>Details about this note.</small></span>
              </header>
              <div class="info-row">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18m-13 4h.01" /></svg>
                <span>Last updated</span>
                <time>{{ formatDate(note?.updatedAt) }}</time>
              </div>
              <div class="info-row">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l3 3v15H6zM15 3v4h4" /></svg>
                <span>Created</span>
                <time>{{ formatDate(note?.createdAt) }}</time>
              </div>
            </section>

            <section class="helper-card preview-card">
              <header class="helper-card__heading">
                <span class="helper-icon helper-icon--blue">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                </span>
                <span><strong>Preview</strong><small>Here’s how your note will look.</small></span>
              </header>
              <article class="preview-note">
                <h2>{{ previewTitle }}</h2>
                <div
                  v-if="content.trim()"
                  class="preview-note__content"
                  v-html="previewContentHtml"
                ></div>
                <div v-else class="preview-empty">
                  Your formatted note will appear here.
                </div>
              </article>
            </section>
          </aside>
        </div>
        <footer class="page-footer">Made for your thoughts <span>✦</span></footer>
      </div>
    </main>
  </div>
</template>

<style scoped>
.edit-page { --page: #f4f7fc; --surface: #fff; --surface-soft: #f7faff; --ink: #18243a; --muted: #7b879b; --line: #e5ebf4; --blue: #2864e8; display: flex; min-height: 100vh; background: var(--page); color: var(--ink); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 14px; }
.edit-page--dark { --page: #111827; --surface: #1a2536; --surface-soft: #202d40; --ink: #edf3ff; --muted: #99a8bd; --line: #2a384c; --blue: #5d8fff; }
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
.page-content { width: min(1440px, 100%); margin: 0 auto; padding: 20px clamp(20px, 3vw, 38px) 16px; }
.back-link { display: inline-flex; align-items: center; gap: 7px; margin-bottom: 12px; padding: 0; border: 0; background: transparent; color: #2164e8; cursor: pointer; font: inherit; font-size: 11px; font-weight: 600; }
.back-link:hover { color: #164bb4; }
.back-link svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.page-heading { position: relative; display: flex; align-items: center; gap: 16px; min-height: 91px; overflow: hidden; margin-bottom: 9px; }
.heading-icon { position: relative; z-index: 2; display: grid; width: 53px; height: 53px; flex: 0 0 auto; place-items: center; border-radius: 13px; background: #e3efff; color: #2168f2; }
.heading-icon svg { width: 27px; height: 27px; fill: currentColor; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.page-heading > div:nth-child(2) { position: relative; z-index: 2; }
.eyebrow { color: #8392aa; font-size: 8px; font-weight: 750; letter-spacing: 1px; }
.page-heading h1 { margin: 3px 0 4px; color: var(--ink); font-size: clamp(21px, 2.4vw, 28px); font-weight: 760; letter-spacing: -.8px; }
.page-heading p { margin: 0; color: var(--muted); font-size: 11px; }
.page-heading p strong { color: #2164e8; }
.heading-art { position: absolute; top: -22px; right: 4px; width: 280px; height: 125px; overflow: hidden; border-radius: 70px; background: radial-gradient(ellipse at 50% 80%, #d9eaff 0%, #eaf3ff 57%, transparent 72%); opacity: .95; }
.edit-page--dark .heading-art { opacity: .42; }
.art-notebook { position: absolute; top: 20px; left: 92px; display: flex; flex-direction: column; gap: 9px; width: 91px; height: 102px; padding: 23px 14px 10px; border: 3px solid #9dc4ff; border-radius: 12px 12px 6px 6px; background: #fff; box-shadow: 0 8px 18px #5484c52c; transform: rotate(-10deg); }
.art-notebook::before { position: absolute; top: -7px; left: 10px; width: 66px; height: 10px; border-top: 3px solid #9dc4ff; background: repeating-linear-gradient(90deg, transparent 0 9px, #9dc4ff 9px 12px, transparent 12px 16px); content: ""; }
.art-notebook span { height: 4px; border-radius: 4px; background: #83b0ff; }
.art-notebook span:nth-child(1) { width: 55px; }
.art-notebook span:nth-child(2) { width: 62px; }
.art-notebook span:nth-child(3) { width: 49px; }
.art-pen { position: absolute; z-index: 2; top: 24px; left: 194px; width: 13px; height: 84px; border: 2px solid #1351ca; border-radius: 7px; background: linear-gradient(90deg, #3e82ff, #1351ca); transform: rotate(28deg); }
.art-pen::before { position: absolute; top: -8px; left: 1px; width: 8px; height: 12px; border-radius: 4px 4px 0 0; background: #1649b0; content: ""; }
.art-leaf { position: absolute; bottom: 9px; left: 41px; width: 28px; height: 52px; border-radius: 100% 0 100% 0; background: #31c993; transform: rotate(-35deg); }
.art-leaf--two { left: 59px; bottom: 1px; width: 25px; height: 44px; background: #22b987; transform: rotate(-65deg); }
.art-leaf--three { left: 222px; bottom: 3px; width: 27px; height: 55px; background: #2ac193; transform: rotate(23deg); }
.art-spark { position: absolute; top: 28px; right: 14px; color: #2674ff; font-size: 25px; }
.editor-layout { display: grid; grid-template-columns: minmax(0, 1.85fr) minmax(245px, .95fr); align-items: start; gap: 14px; }
.editor-card, .helper-card { border: 1px solid var(--line); border-radius: 12px; background: var(--surface); box-shadow: 0 4px 15px #25395809; }
.editor-card { padding: 18px 20px 16px; }
.note-form { display: grid; }
.field-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.field-heading label { color: var(--ink); font-size: 11px; font-weight: 700; }
.field-heading > span { color: #8a9ab3; font-size: 9px; }
.title-input { display: flex; align-items: center; gap: 10px; min-height: 41px; padding: 0 12px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface-soft); transition: border-color .18s ease, box-shadow .18s ease; }
.title-input:focus-within { border-color: #75a2ff; box-shadow: 0 0 0 3px #3478f51b; }
.title-input svg { width: 16px; height: 16px; flex: 0 0 auto; fill: none; stroke: #546b8d; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.title-input input { width: 100%; padding: 11px 0; border: 0; outline: 0; background: transparent; color: var(--ink); font: inherit; font-size: 11px; }
.title-input input::placeholder { color: #8c9bb1; }
.character-count { margin-top: 5px; color: #8b9ab1; font-size: 9px; text-align: right; }
.category-field { margin-top: 15px; }
.category-field select { width: 100%; min-height: 40px; padding: 0 12px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface-soft); color: var(--ink); font: inherit; font-size: 11px; }
.category-field select:focus { border-color: #75a2ff; outline: 0; box-shadow: 0 0 0 3px #3478f51b; }
.content-heading { margin-top: 17px; }
.content-heading .field-heading { margin-bottom: 8px; }
.editor-hint { margin: 6px 0 0; color: var(--muted); font-size: 9px; }
.character-count--content { margin-top: 6px; }
.form-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 19px; padding-top: 15px; border-top: 1px solid var(--line); }
.cancel-button, .save-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 39px; border-radius: 8px; cursor: pointer; font: inherit; font-size: 11px; font-weight: 650; }
.cancel-button { min-width: 120px; padding: 0 18px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); }
.cancel-button:hover { background: var(--surface-soft); }
.save-button { min-width: min(300px, 65%); padding: 0 20px; border: 0; background: #2864e8; color: white; box-shadow: 0 5px 12px #2864e82b; transition: background .18s ease, transform .18s ease; }
.save-button:hover:not(:disabled) { background: #1e56d2; transform: translateY(-1px); }
.save-button:disabled { cursor: not-allowed; opacity: .55; }
.save-button svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.form-message { margin-bottom: 14px; padding: 10px 12px; border: 1px solid; border-radius: 8px; font-size: 11px; line-height: 1.5; }
.form-message--error { border-color: #f1c7ca; background: #fff4f4; color: #c43e48; }
.form-message--success { border-color: #bee8d0; background: #effbf4; color: #198550; }
.helper-column { display: grid; gap: 12px; }
.helper-card { padding: 14px; }
.tips-card { border-color: #dbe9ff; background: linear-gradient(145deg, #edf5ff, #e5f0ff); }
.edit-page--dark .tips-card { border-color: #304968; background: linear-gradient(145deg, #1d3049, #213651); }
.helper-card__heading { display: flex; align-items: center; gap: 10px; }
.helper-card__heading > span:last-child { display: grid; gap: 3px; min-width: 0; }
.helper-card__heading strong { color: var(--ink); font-size: 11px; }
.helper-card__heading small { color: var(--muted); font-size: 9px; }
.helper-icon { display: grid; width: 31px; height: 31px; flex: 0 0 auto; place-items: center; border-radius: 50%; background: #fff; color: #216afa; }
.helper-icon svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.helper-icon--purple { background: #f2eaff; color: #8a50eb; }
.tips-list { display: grid; gap: 7px; margin: 12px 0 0; padding: 0; list-style: none; }
.tips-list li { position: relative; padding-left: 23px; color: #5f718e; font-size: 9px; line-height: 1.4; }
.edit-page--dark .tips-list li { color: #bdcbe0; }
.tips-list li::before { position: absolute; left: 2px; top: 0; color: #10a790; content: "✓"; font-size: 14px; font-weight: 700; line-height: 12px; }
.info-card { display: grid; gap: 12px; }
.info-row { display: grid; grid-template-columns: 16px minmax(65px, 1fr) auto; align-items: center; gap: 8px; color: #687d9e; font-size: 9px; }
.info-row svg { width: 15px; height: 15px; fill: none; stroke: #526b91; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.info-row time { color: #8493aa; font-size: 8px; text-align: right; }
.preview-card { padding: 14px; }
.preview-note { overflow: hidden; margin-top: 11px; border: 1px solid var(--line); border-radius: 9px; background: var(--surface-soft); }
.preview-note h2 { overflow: hidden; margin: 0; padding: 10px 12px; border-bottom: 1px solid var(--line); color: var(--ink); font-size: 11px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.preview-note__content { max-height: 92px; overflow: hidden; padding: 9px 12px 10px; color: #70819d; font-size: 9px; line-height: 1.55; overflow-wrap: anywhere; }
.preview-note__content :deep(p) { margin: 0 0 5px; }
.preview-note__content :deep(ul), .preview-note__content :deep(ol) { margin: 0; padding-left: 15px; }
.preview-note__content :deep(pre), .preview-note__content :deep(code) { border-radius: 4px; background: var(--line); font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
.preview-note__content :deep(pre) { overflow: hidden; padding: 5px; }
.preview-note__content :deep(a) { color: #2864e8; text-decoration: underline; }
.preview-empty { min-height: 40px; padding: 9px 12px 4px; color: #98a6ba; font-size: 9px; }
.state-card { display: grid; justify-items: center; gap: 8px; min-height: 240px; align-content: center; padding: 25px; border: 1px solid var(--line); border-radius: 12px; background: var(--surface); text-align: center; box-shadow: 0 4px 15px #25395809; }
.state-card > strong { color: var(--ink); font-size: 14px; }
.state-card > p { margin: 0; color: var(--muted); font-size: 11px; }
.loading-spinner { width: 26px; height: 26px; margin-bottom: 5px; border: 3px solid var(--line); border-top-color: var(--blue); border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.state-card__icon { display: grid; width: 32px; height: 32px; place-items: center; border-radius: 50%; background: #fff0f0; color: #c43e48; font-weight: 800; }
.state-card--error { border-color: #f1c7ca; }
.state-card__retry { margin-top: 5px; min-width: 110px; }
.page-footer { padding-top: 15px; color: #a0a9b7; font-size: 9px; text-align: center; }
.page-footer span { color: #f4b735; }

@media (max-width: 950px) {
  .sidebar { flex-basis: 190px; }
  .editor-layout { grid-template-columns: minmax(0, 1.5fr) minmax(220px, .9fr); }
  .editor-card { padding: 15px; }
  .heading-art { right: -25px; opacity: .6; }
}
@media (max-width: 760px) {
  .sidebar { flex-basis: 62px; align-items: center; padding: 16px 7px 12px; }
  .brand { margin: 0 0 27px; }
  .brand__copy, .sidebar__label, .side-nav__item span, .sidebar-tip, .sidebar__username, .sidebar__logout { display: none; }
  .side-nav { width: 100%; }
  .side-nav__item { justify-content: center; padding: 0; }
  .side-nav__item svg { width: 18px; height: 18px; }
  .sidebar__footer { justify-content: center; width: 100%; padding-top: 10px; }
  .editor-layout { grid-template-columns: minmax(0, 1.4fr) minmax(205px, .9fr); }
  .topbar__actions { gap: 12px; }
}
@media (max-width: 600px) {
  .sidebar { flex-basis: 52px; padding: 13px 5px 10px; }
  .brand { margin-bottom: 22px; }
  .brand__mark { width: 35px; height: 35px; }
  .topbar { min-height: 54px; gap: 8px; padding: 0 10px; }
  .search-button { width: 100%; height: 33px; gap: 6px; padding: 0 8px; font-size: 9px; }
  .search-button kbd { display: none; }
  .topbar__actions { gap: 5px; }
  .profile-button__name, .profile-button > svg { display: none; }
  .avatar { width: 27px; height: 27px; }
  .page-content { padding: 15px 12px; }
  .back-link { margin-bottom: 9px; }
  .page-heading { min-height: 77px; gap: 10px; margin-bottom: 10px; }
  .heading-icon { width: 43px; height: 43px; border-radius: 11px; }
  .heading-icon svg { width: 22px; height: 22px; }
  .page-heading h1 { font-size: 20px; }
  .page-heading p { max-width: 240px; font-size: 9px; line-height: 1.5; }
  .heading-art { right: -82px; opacity: .3; }
  .editor-layout { grid-template-columns: 1fr; gap: 11px; }
  .editor-card { padding: 14px; }
  .helper-column { grid-template-columns: 1fr; }
  .helper-card { padding: 13px; }
  .tips-list { grid-template-columns: 1fr 1fr; gap: 9px; }
  .tips-list li { font-size: 9px; }
  .preview-note { margin-top: 9px; }
}
@media (max-width: 380px) {
  .page-heading h1 { font-size: 18px; }
  .page-heading p { max-width: 190px; font-size: 8px; }
  .editor-card { padding: 11px; }
  .form-actions { gap: 8px; }
  .cancel-button { min-width: 84px; }
  .save-button { min-width: 0; flex: 1; }
  .tips-list { grid-template-columns: 1fr; }
  .info-row { grid-template-columns: 16px 1fr auto; gap: 6px; }
  .info-row time { font-size: 7px; }
}
</style>
