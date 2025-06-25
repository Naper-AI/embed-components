import { AbstractComponent } from "./AbstractComponent";
import DataCache from "../helpers/DataCache";

export class CategoryData extends AbstractComponent {
    protected external_id: string = '';
    protected data_external_id: string = '';
    protected data: string = '';
    protected data_path: string = '';
    protected data_key: string = '';
    protected category: {
        description: string;
        long_description: string;
        name: string;
    } | null = null;

    static get observedAttributes() {
      return ['external-id', 'data-external-id', 'data-path', 'data', 'data-key'];
    }

    protected async onInit() {
        this.external_id = this.data_external_id || this.external_id;

        if (!this.config || (!this.external_id && !this.data_path)) {
            return;
        }

        if (this.external_id.startsWith('${')) {
            const callback = this.external_id.slice(2, -1);
            this.external_id = eval(callback);
        }

        if (this.data_path.startsWith('${')) {
            const callback = this.data_path.slice(2, -1);
            this.data_path = eval(callback);
        }

        if (!this.external_id && !this.data_path) {
            return;
        }

        const store = this.config.store.endsWith('/') ? this.config.store : `${this.config.store}/`;
        let query = '';

        if (this.data_path) {
            query = `path=${this.data_path}`;
        } else {
            query = `integration_type=${this.config.integration.type}`;
            query += `&integration_name=${this.config.integration.name}`;
            query += `&integration_id=${this.external_id}`;
            query += '&limit=1';
        }

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
    }

    protected render() {
        if (!this.category || (!this.data && !this.data_key)) {
            return;
        }

        const key = this.data_key || this.data;
        this.innerHTML = this.category[key as keyof typeof this.category] || '';
    }
}
  
  // Define the custom element
  customElements.define('category-data', CategoryData); 