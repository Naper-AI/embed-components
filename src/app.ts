// Import web components
import * as components from './components';
import { AppConfig } from './types';

export { components };

export class NaperComponents {
  static config: AppConfig;

  static init(config: AppConfig) {
    this.config = config;
    document.dispatchEvent(new CustomEvent(
        'naper-components-init',
        { detail: config }
    ));
  }
}
