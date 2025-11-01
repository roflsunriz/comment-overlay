export type ShortcutCallback = () => void;

type ShortcutMap = Map<string, ShortcutCallback>;

const INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

const normalizeKey = (key: string): string => (key.length === 1 ? key.toUpperCase() : key);

const buildModifierPrefix = (modifier: string | null): string => (modifier ? `${modifier}+` : "");

export class KeyboardShortcutHandler {
  private readonly shortcuts: ShortcutMap = new Map();
  private readonly boundHandler: (event: KeyboardEvent) => void;
  private isEnabled = true;
  private isListening = false;

  constructor() {
    this.boundHandler = this.handleKeyDown.bind(this);
  }

  addShortcut(key: string, modifier: string | null, callback: ShortcutCallback): void {
    const shortcutKey = this.createShortcutKey(normalizeKey(key), modifier);
    this.shortcuts.set(shortcutKey, callback);
  }

  removeShortcut(key: string, modifier: string | null): void {
    const shortcutKey = this.createShortcutKey(normalizeKey(key), modifier);
    this.shortcuts.delete(shortcutKey);
  }

  startListening(): void {
    if (this.isListening) {
      return;
    }
    document.addEventListener("keydown", this.boundHandler, false);
    this.isListening = true;
  }

  stopListening(): void {
    if (!this.isListening) {
      return;
    }
    document.removeEventListener("keydown", this.boundHandler, false);
    this.isListening = false;
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  private createShortcutKey(key: string, modifier: string | null): string {
    return `${buildModifierPrefix(modifier)}${key}`;
  }

  private extractModifier(event: KeyboardEvent): string | null {
    const modifiers: string[] = [];
    if (event.ctrlKey) {
      modifiers.push("Ctrl");
    }
    if (event.altKey) {
      modifiers.push("Alt");
    }
    if (event.shiftKey) {
      modifiers.push("Shift");
    }
    if (event.metaKey) {
      modifiers.push("Meta");
    }
    return modifiers.length > 0 ? modifiers.join("+") : null;
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isEnabled) {
      return;
    }

    const target = event.target as HTMLElement | null;
    const tagName = target?.tagName ?? "";
    if (INPUT_TAGS.has(tagName)) {
      return;
    }

    const modifier = this.extractModifier(event);
    const shortcutKey = this.createShortcutKey(normalizeKey(event.key), modifier);
    const callback = this.shortcuts.get(shortcutKey);

    if (callback) {
      event.preventDefault();
      callback();
    }
  }
}
