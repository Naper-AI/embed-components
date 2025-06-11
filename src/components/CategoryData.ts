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

        if (this.external_id.startsWith('${')) {
            const callback = this.external_id.slice(2, -1);
            this.external_id = eval(callback);
        }

        if (!this.external_id) {
            return;
        }

        const store = this.config.store.endsWith('/') ? this.config.store : `${this.config.store}/`;
        let query = `integration_type=${this.config.integration.type}`;
        query += `&integration_name=${this.config.integration.name}`;
        query += `&integration_id=${this.external_id}`;
        query += '&limit=1';

        const url = `${store}wp-json/wc/v3/products/categories?${query}`;

        const response = await DataCache.fetchOrCache(
            url,
            async () => {
                const response = await fetch(url);
                return await response.json();
            },
            { ttlMs: 1000 * 60 * 5 } // 5 minutes TTL
        );

        if (response.length > 0) {
            this.category = response[0];
        } 

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