import { AbstractComponent } from "./AbstractComponent";

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

        // Makes a request to the API to get the data
        const url = `${store}wp-json/wc/v3/products/categories/${this.external_id}`;
        const response = await fetch(url);
        const data = await response.json();

        this.category = data;
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