import { AppConfig } from "../types";

export abstract class AbstractComponent extends HTMLElement {
    protected config: AppConfig | null = null;

    protected abstract onInit(): void;
    protected abstract render(): void;

    static get observedAttributes(): string[] {
        return [];
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    disconnectedCallback() {
        document.removeEventListener('naper-components-init', this.initHandler.bind(this));
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        const childClass = this.constructor as typeof AbstractComponent;
        if (!childClass.observedAttributes.includes(name)) {
            return;
        }

        const attributeName = name.replace(/-/g, '_');
        (this as any)[attributeName] = newValue;
        this.render();
    }

    protected setupEventListeners() {
        document.addEventListener('naper-components-init', this.initHandler.bind(this));
    }

    private initHandler(evt: Event) {
        const customEvent = evt as CustomEvent<AppConfig>;
        this.config = customEvent.detail;
        this.onInit();
    }
}