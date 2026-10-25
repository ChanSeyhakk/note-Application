<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";
import { renderMarkdown } from "../utils/markdown";

const props = withDefaults(
  defineProps<{ id: string; placeholder?: string; maxlength?: number }>(),
  { placeholder: "Write your thoughts, ideas, or plans here...", maxlength: 10000 },
);

const content = defineModel<string>({ required: true });
const emit = defineEmits<{ "character-count": [count: number] }>();
const editor = ref<HTMLDivElement | null>(null);
const expanded = ref(false);
const limitReached = ref(false);
let lastEmittedValue: string | null = null;

const escapeMarkdown = (value: string) =>
  value.replace(/[\\`*_{}[\]()#+.!|>~-]/g, "\\$&");

const serializeInline = (node: Node): string => {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeMarkdown(node.textContent ?? "");
  }
  if (!(node instanceof HTMLElement)) return "";

  const children = Array.from(node.childNodes)
    .map(serializeInline)
    .join("");

  switch (node.tagName) {
    case "STRONG":
    case "B":
      return `**${children}**`;
    case "EM":
    case "I":
      return `*${children}*`;
    case "U":
      return `++${children}++`;
    case "CODE":
      return `\`${(node.textContent ?? "").replace(/`/g, "\\`")}\``;
    case "A": {
      const href = node.getAttribute("href") ?? "";
      try {
        const url = new URL(href);
        if (!["http:", "https:", "mailto:"].includes(url.protocol)) return children;
        return `[${children}](${href.replace(/[()\\]/g, "\\$&")})`;
      } catch {
        return children;
      }
    }
    case "BR":
      return "\n";
    case "P":
    case "DIV":
      return `${children}\n\n`;
    case "UL":
    case "OL": {
      const items = Array.from(node.children).filter(
        (child) => child.tagName === "LI",
      );
      const list = items
        .map((item, index) => {
          const prefix = node.tagName === "OL" ? `${index + 1}. ` : "- ";
          const nestedLists = Array.from(item.children).filter(
            (child) => child.tagName === "UL" || child.tagName === "OL",
          );
          const directNodes = Array.from(item.childNodes).filter(
            (child) =>
              !(child instanceof HTMLElement) ||
              (child.tagName !== "UL" && child.tagName !== "OL"),
          );
          const line = directNodes.map(serializeInline).join("").trim();
          const nested = nestedLists.map(serializeInline).join("");
          return `${prefix}${line}${nested ? `\n  ${nested.trim().replace(/\n/g, "\n  ")}` : ""}`;
        })
        .join("\n");
      return `${list}\n\n`;
    }
    case "PRE":
      return `\`\`\`\n${node.textContent ?? ""}\n\`\`\`\n\n`;
    default:
      return children;
  }
};

const serializeEditor = () =>
  Array.from(editor.value?.childNodes ?? [])
    .map(serializeInline)
    .join("")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const syncContent = () => {
  const value = serializeEditor();
  const plainText = editor.value?.innerText.replace(/\n$/, "") ?? "";
  emit("character-count", plainText.length);

  if (value.length > props.maxlength) {
    limitReached.value = true;
    return;
  }

  limitReached.value = false;
  lastEmittedValue = value;
  content.value = value;
};

watch(content, async (value) => {
  if (value === lastEmittedValue || !editor.value) {
    lastEmittedValue = null;
    return;
  }

  await nextTick();
  if (editor.value) editor.value.innerHTML = renderMarkdown(value);
  emit("character-count", editor.value?.innerText.replace(/\n$/, "").length ?? 0);
  limitReached.value = false;
});

onMounted(() => {
  if (editor.value) editor.value.innerHTML = renderMarkdown(content.value);
  emit("character-count", editor.value?.innerText.replace(/\n$/, "").length ?? 0);
});

const runCommand = (command: string) => {
  editor.value?.focus();
  document.execCommand(command, false);
  syncContent();
};

const insertLink = () => {
  const urlInput = window.prompt("Enter the link URL (https://...)");
  if (!urlInput) return;

  let url: URL;
  try {
    url = new URL(urlInput.trim());
  } catch {
    window.alert("Enter a valid link starting with https:// or http://.");
    return;
  }
  if (!["http:", "https:", "mailto:"].includes(url.protocol)) {
    window.alert("Only http, https, and mailto links are allowed.");
    return;
  }

  editor.value?.focus();
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  if (selection.isCollapsed) {
    const link = document.createElement("a");
    link.href = url.href;
    link.textContent = urlInput.trim();
    selection.getRangeAt(0).insertNode(link);
    const range = document.createRange();
    range.setStartAfter(link);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  } else {
    document.execCommand("createLink", false, url.href);
  }
  syncContent();
};

const insertCode = () => {
  editor.value?.focus();
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const code = document.createElement("code");
  if (range.collapsed) {
    code.textContent = "code";
    range.insertNode(code);
    range.selectNodeContents(code);
  } else {
    code.append(range.extractContents());
    range.insertNode(code);
    range.selectNodeContents(code);
  }
  selection.removeAllRanges();
  selection.addRange(range);
  syncContent();
};

const pastePlainText = (event: ClipboardEvent) => {
  event.preventDefault();
  const text = event.clipboardData?.getData("text/plain");
  if (text) document.execCommand("insertText", false, text);
  syncContent();
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
        @mousedown.prevent
        @click="runCommand('bold')"
      >B</button>
      <button
        type="button"
        class="toolbar-button toolbar-letter toolbar-letter--italic"
        aria-label="Italic"
        title="Italic"
        @mousedown.prevent
        @click="runCommand('italic')"
      >I</button>
      <button
        type="button"
        class="toolbar-button toolbar-letter toolbar-letter--underline"
        aria-label="Underline"
        title="Underline"
        @mousedown.prevent
        @click="runCommand('underline')"
      >U</button>
      <span class="toolbar-divider"></span>
      <button
        type="button"
        class="toolbar-button"
        aria-label="Bulleted list"
        title="Bulleted list"
        @mousedown.prevent
        @click="runCommand('insertUnorderedList')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" /></svg>
      </button>
      <button
        type="button"
        class="toolbar-button"
        aria-label="Numbered list"
        title="Numbered list"
        @mousedown.prevent
        @click="runCommand('insertOrderedList')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 6h10M10 12h10M10 18h10M4 5h1v3m-1 4h2l-2 3h2m-2 2h2v3H4" /></svg>
      </button>
      <span class="toolbar-divider"></span>
      <button
        type="button"
        class="toolbar-button"
        aria-label="Insert link"
        title="Insert link"
        @mousedown.prevent
        @click="insertLink"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1" /></svg>
      </button>
      <button
        type="button"
        class="toolbar-button"
        aria-label="Inline code"
        title="Inline code"
        @mousedown.prevent
        @click="insertCode"
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
      <div
        :id="id"
        ref="editor"
        class="editor__input"
        contenteditable="true"
        role="textbox"
        aria-multiline="true"
        :aria-label="id === 'content' ? 'Note content' : id"
        :data-placeholder="placeholder"
        spellcheck="true"
        @input="syncContent"
        @paste="pastePlainText"
      ></div>
    </div>
    <div v-if="limitReached" class="editor__limit" role="alert">
      Content limit reached ({{ maxlength }} characters).
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
.editor__input { display: block; width: 100%; min-height: 185px; overflow-y: auto; padding: 13px 14px 14px 40px; outline: 0; background: transparent; color: var(--ink); font: inherit; font-size: 11px; line-height: 1.65; white-space: pre-wrap; overflow-wrap: anywhere; }
.editor__input:empty::before { color: #8c9bb1; content: attr(data-placeholder); pointer-events: none; }
.editor__input :deep(p) { margin: 0 0 7px; }
.editor__input :deep(ul), .editor__input :deep(ol) { margin: 0 0 7px; padding-left: 23px; }
.editor__input :deep(a) { color: var(--blue); text-decoration: underline; }
.editor__input :deep(code) { border-radius: 4px; background: var(--line); font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
.editor__limit { padding: 5px 12px; color: #c43e48; font-size: 10px; }
.editor--expanded { position: fixed; z-index: 50; inset: 3vh 3vw; display: flex; flex-direction: column; border-radius: 12px; box-shadow: 0 20px 70px #0005; }
.editor--expanded .editor__toolbar { flex: 0 0 auto; min-height: 48px; gap: 14px; padding: 0 16px; }
.editor--expanded .editor__input-wrap { flex: 1; min-height: 0; overflow-y: auto; }
.editor--expanded .editor__input { height: 100%; min-height: 0; padding-top: 18px; font-size: 14px; }
@media (max-width: 480px) { .editor__toolbar { gap: 5px; padding: 0 6px; } }
</style>
