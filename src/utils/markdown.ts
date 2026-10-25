import MarkdownIt from "markdown-it";

const markdown = new MarkdownIt({
  breaks: true,
  html: false,
  linkify: false,
});

markdown.inline.ruler.before("emphasis", "underline", (state, silent) => {
  const start = state.pos;
  if (!state.src.startsWith("++", start)) return false;

  const end = state.src.indexOf("++", start + 2);
  if (end < 0 || end === start + 2) return false;

  if (!silent) {
    const open = state.push("html_inline", "", 0);
    open.content = "<u>";

    const text = state.push("text", "", 0);
    text.content = state.src.slice(start + 2, end);

    const close = state.push("html_inline", "", 0);
    close.content = "</u>";
  }

  state.pos = end + 2;
  return true;
});

export const renderMarkdown = (value: string) => markdown.render(value);
