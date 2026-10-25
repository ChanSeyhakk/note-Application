<script setup lang="ts">
import { nextTick, ref } from "vue";

withDefaults(
  defineProps<{
    id: string;
    placeholder?: string;
    maxlength?: number;
  }>(),
  {
    placeholder: "Write your thoughts, ideas, or plans here...",
    maxlength: 10000,
  },
);

const content = defineModel<string>({ required: true });
const textarea = ref<HTMLTextAreaElement | null>(null);
const expanded = ref(false);

const replaceSelection = (
  before: string,
  after: string,
  defaultText: string,
) => {
  const field = textarea.value;
  if (!field) return;

  const value = content.value;
  const start = field.selectionStart;
  const end = field.selectionEnd;
  const selected = value.slice(start, end);
  const insertion = selected || defaultText;
  const nextValue =
    value.slice(0, start) +
    before +
    insertion +
    after +
    value.slice(end);

  if (nextValue.length > field.maxLength) return;
  content.value = nextValue;

  const selectionStart = start + before.length;
  const selectionEnd = selectionStart + insertion.length;
  void nextTick(() => {
    field.focus();
    field.setSelectionRange(selectionStart, selectionEnd);
  });
};

const toggleWrap = (marker: string, defaultText: string) => {
  const field = textarea.value;
  if (!field) return;

  const value = content.value;
  const start = field.selectionStart;
  const end = field.selectionEnd;
  const selected = value.slice(start, end);

  if (
    selected.length > marker.length * 2 &&
    selected.startsWith(marker) &&
    selected.endsWith(marker)
  ) {
    const unwrapped = selected.slice(marker.length, -marker.length);
    content.value =
      value.slice(0, start) + unwrapped + value.slice(end);
    void nextTick(() => {
      field.focus();
      field.setSelectionRange(start, start + unwrapped.length);
    });
    return;
  }

  replaceSelection(marker, marker, defaultText);
};

const formatList = (marker: "- " | "1. ") => {
  const field = textarea.value;
  if (!field) return;

  const value = content.value;
  const start = field.selectionStart;
  const end = field.selectionEnd;
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const lineEndIndex = value.indexOf("\n", end);
  const lineEnd = lineEndIndex < 0 ? value.length : lineEndIndex;
  const selectedLines = value.slice(lineStart, lineEnd);
  const lines = selectedLines.split("\n");
  const updatedLines = lines.map((line, index) => {
    const prefix = marker === "1. " ? `${index + 1}. ` : marker;
    return line.startsWith(prefix) ? line.slice(prefix.length) : prefix + line;
  });
  const replacement = updatedLines.join("\n");
  const nextValue =
    value.slice(0, lineStart) + replacement + value.slice(lineEnd);

  if (nextValue.length > field.maxLength) return;
  content.value = nextValue;

  void nextTick(() => {
    field.focus();
    field.setSelectionRange(lineStart, lineStart + replacement.length);
  });
};

const insertLink = () => {
  const field = textarea.value;
  if (!field) return;

  const value = content.value;
  const start = field.selectionStart;
  const end = field.selectionEnd;
  const label = value.slice(start, end) || "link text";
  const url = "https://example.com";
  const insertion = `[${label}](${url})`;
  const nextValue = value.slice(0, start) + insertion + value.slice(end);

  if (nextValue.length > field.maxLength) return;
  content.value = nextValue;

  const urlStart = start + label.length + 3;
  void nextTick(() => {
    field.focus();
    field.setSelectionRange(urlStart, urlStart + url.length);
  });
};
</script>

<template>
  <div class="editor" :class="{ 'editor--expanded': expanded }">
    <div class="editor__toolbar" aria-label="Formatting toolbar">
      <button
        type="button"
        class="toolbar-button toolbar-letter toolbar-letter--bold"
        aria-label="Bold"
        title="Bold"
        @click="toggleWrap('**', 'bold text')"
      >B</button>
      <button
        type="button"
        class="toolbar-button toolbar-letter toolbar-letter--italic"
        aria-label="Italic"
        title="Italic"
        @click="toggleWrap('*', 'italic text')"
      >I</button>
      <button
        type="button"
        class="toolbar-button toolbar-letter toolbar-letter--underline"
        aria-label="Underline"
        title="Underline"
        @click="toggleWrap('++', 'underlined text')"
      >U</button>
      <span class="toolbar-divider"></span>
      <button
        type="button"
        class="toolbar-button"
        aria-label="Bulleted list"
        title="Bulleted list"
        @click="formatList('- ')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" /></svg>
      </button>
      <button
        type="button"
        class="toolbar-button"
        aria-label="Numbered list"
        title="Numbered list"
        @click="formatList('1. ')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 6h10M10 12h10M10 18h10M4 5h1v3m-1 4h2l-2 3h2m-2 2h2v3H4" /></svg>
      </button>
      <span class="toolbar-divider"></span>
      <button
        type="button"
        class="toolbar-button"
        aria-label="Insert link"
        title="Insert link"
        @click="insertLink"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1" /></svg>
      </button>
      <button
        type="button"
        class="toolbar-button"
        aria-label="Inline code"
        title="Inline code"
        @click="toggleWrap('`', 'code')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 8-4 4 4 4m8-8 4 4-4 4m-3-11-2 14" /></svg>
      </button>
      <span class="toolbar-spacer"></span>
      <button
        type="button"
        class="toolbar-button"
        :aria-label="expanded ? 'Exit expanded editor' : 'Expand editor'"
        :title="expanded ? 'Exit expanded editor' : 'Expand editor'"
        @click="expanded = !expanded"
      >
        <svg v-if="!expanded" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8V4h4m12 12v4h-4M5 19l5-5m9-9-5 5" /></svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4v4H4m12 12v-4h4M5 5l5 5m9 9-5-5" /></svg>
      </button>
    </div>
    <div class="editor__input-wrap">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15z" /></svg>
      <textarea
        :id="id"
        ref="textarea"
        v-model="content"
        :maxlength="maxlength"
        :placeholder="placeholder"
        spellcheck="true"
      ></textarea>
    </div>
  </div>
</template>

<style scoped>
.editor {
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface-soft);
}

.editor:focus-within {
  border-color: #75a2ff;
  box-shadow: 0 0 0 3px #3478f51b;
}

.editor__toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 39px;
  padding: 0 10px;
  border-bottom: 1px solid var(--line);
  background: var(--surface);
  color: #536a8c;
}

.toolbar-button {
  display: grid;
  width: 25px;
  height: 27px;
  flex: 0 0 auto;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.toolbar-button:hover,
.toolbar-button:focus-visible {
  background: var(--surface-soft);
  color: var(--blue);
}

.toolbar-button:focus-visible {
  outline: 2px solid #4382ff9c;
  outline-offset: 1px;
}

.toolbar-button svg {
  width: 15px;
  height: 15px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.toolbar-letter {
  font-family: Georgia, serif;
  font-size: 14px;
}

.toolbar-letter--bold { font-weight: 700; }
.toolbar-letter--italic { font-style: italic; }
.toolbar-letter--underline { text-decoration: underline; }
.toolbar-divider { width: 1px; height: 17px; flex: 0 0 auto; background: var(--line); }
.toolbar-spacer { flex: 1; }
.editor__input-wrap { position: relative; min-height: 185px; }
.editor__input-wrap > svg { position: absolute; top: 14px; left: 13px; width: 16px; height: 16px; fill: none; stroke: #50698d; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.editor__input-wrap textarea { display: block; width: 100%; min-height: 185px; resize: vertical; padding: 13px 14px 14px 40px; border: 0; outline: 0; background: transparent; color: var(--ink); font: inherit; font-size: 11px; line-height: 1.65; }
.editor__input-wrap textarea::placeholder { color: #8c9bb1; }
.editor--expanded { position: fixed; z-index: 50; inset: 3vh 3vw; display: flex; flex-direction: column; border-radius: 12px; box-shadow: 0 20px 70px #0005; }
.editor--expanded .editor__toolbar { flex: 0 0 auto; min-height: 48px; gap: 14px; padding: 0 16px; }
.editor--expanded .editor__input-wrap { flex: 1; min-height: 0; }
.editor--expanded .editor__input-wrap textarea { height: 100%; min-height: 0; resize: none; padding-top: 18px; font-size: 14px; }
@media (max-width: 480px) { .editor__toolbar { gap: 5px; padding: 0 6px; } }
</style>
