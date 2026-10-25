export const NOTE_CATEGORIES = [
  "Work",
  "Study",
  "Personal",
  "Ideas",
  "Other",
] as const;

export type NoteCategory = (typeof NOTE_CATEGORIES)[number];

export const readSavedNoteCategories = (): Record<string, string> => {
  try {
    const saved = JSON.parse(localStorage.getItem("noteCategories") ?? "{}");
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(saved).filter(
        (entry): entry is [string, string] =>
          typeof entry[1] === "string" && entry[1].trim().length > 0,
      ),
    );
  } catch (error) {
    console.error("Unable to read saved note categories.", error);
    return {};
  }
};

export const saveNoteCategory = (
  noteId: number,
  category: string,
): boolean => {
  try {
    const categories = readSavedNoteCategories();
    if (category) {
      categories[String(noteId)] = category;
    } else {
      delete categories[String(noteId)];
    }
    localStorage.setItem("noteCategories", JSON.stringify(categories));
    return true;
  } catch (error) {
    console.error("Unable to save the note category in this browser.", error);
    return false;
  }
};

export const getCategoryTone = (category: string): string => {
  switch (category) {
    case "Work":
      return "blue";
    case "Study":
      return "green";
    case "Personal":
      return "rose";
    case "Ideas":
      return "purple";
    default:
      return "amber";
  }
};
