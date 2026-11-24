export const OPEN_QUOTE_EVENT = "open-quote-form";

// Open the quote form from anywhere (Contact button, character speech bubble)
export function openQuoteForm(source: string) {
  window.dispatchEvent(new CustomEvent(OPEN_QUOTE_EVENT, { detail: source }));
}
