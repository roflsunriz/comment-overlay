export class ShadowDOMComponent {
  protected shadowRoot: ShadowRoot | null = null;
  protected container: HTMLDivElement | null = null;

  createShadowDOM(
    hostElement: HTMLElement,
    options: ShadowRootInit = { mode: "closed" },
  ): ShadowRoot {
    if (!hostElement) {
      throw new Error("Host element is required for shadow DOM creation");
    }

    this.shadowRoot = hostElement.attachShadow(options);
    this.container = document.createElement("div");
    this.shadowRoot.appendChild(this.container);
    return this.shadowRoot;
  }

  addStyles(cssText: string): void {
    if (!this.shadowRoot) {
      throw new Error("Shadow root not initialized");
    }
    const style = document.createElement("style");
    style.textContent = cssText;
    this.shadowRoot.appendChild(style);
  }

  querySelector<T extends Element>(selector: string): T | null {
    if (!this.shadowRoot) {
      return null;
    }
    return this.shadowRoot.querySelector<T>(selector);
  }

  querySelectorAll<T extends Element>(selector: string): NodeListOf<T> {
    if (!this.shadowRoot) {
      return document.createDocumentFragment()
        .childNodes as unknown as NodeListOf<T>;
    }
    return this.shadowRoot.querySelectorAll<T>(selector);
  }

  setHTML(html: string): void {
    if (!this.container) {
      throw new Error("Container not initialized");
    }
    this.container.innerHTML = html;
  }

  destroy(): void {
    if (this.shadowRoot?.host) {
      this.shadowRoot.host.remove();
    }
    this.shadowRoot = null;
    this.container = null;
  }
}
