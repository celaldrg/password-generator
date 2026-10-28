/**
 * Copying text to the clipboard: the async Clipboard API where it is
 * available, otherwise the older execCommand route through a hidden
 * textarea (for example on plain http:// or in older browsers).
 */

/**
 * Copies text to the clipboard.
 * @param {string} text
 * @returns {Promise<boolean>} Whether the text was copied.
 */
export async function copyText(text) {
  if (window.isSecureContext && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return legacyCopy(text);
    }
  }
  return legacyCopy(text);
}

function legacyCopy(text) {
  const previousFocus = document.activeElement;
  const buffer = document.createElement('textarea');
  buffer.value = text;
  buffer.readOnly = true;
  buffer.className = 'clipboard-buffer';
  document.body.append(buffer);
  buffer.select();
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }
  buffer.remove();
  if (previousFocus instanceof HTMLElement) previousFocus.focus();
  return copied;
}
