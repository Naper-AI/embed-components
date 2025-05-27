import { AbstractComponent } from "./AbstractComponent";
import DataCache from "../helpers/DataCache";

export class CategoryData extends AbstractComponent {
    protected external_id: string = '';
    protected data: string = '';
    protected category: {
        description: string;
    } | null = null;

    static get observedAttributes() {
      return ['external-id', 'data'];
    }

    protected async onInit() {
        if (!this.config || !this.external_id) {
            return;
        }

        const store = this.config.store.endsWith('/') ? this.config.store : `${this.config.store}/`;
        const url = `${store}wp-json/wc/v3/products/categories/${this.external_id}`;

        this.category = await DataCache.fetchOrCache(
            url,
            async () => {
                const response = await fetch(url);
                return await response.json();
            },
            { ttlMs: 1000 * 60 * 60 } // 1 hour TTL
        );

        this.render();
    }

    protected render() {
        if (!this.data || !this.category) {
            this.innerHTML = '';
            return;
        }

        this.innerHTML = this.category[this.data as keyof typeof this.category] || '';
    }
}
  
  // Define the custom element
  customElements.define('category-data', CategoryData); 