export type AppConfig = {
    store: string;
    integration: {
        type: 'vtex' | 'shopify';
        name: string;
    };
}

export type NaperComponentsEvent = {
    type: 'naper-components-init';
    detail: AppConfig;
}