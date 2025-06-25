# Naper Embed Components

A JavaScript library to embed product category data into web pages using Web Components.

## Installation

### CDN (Recommended)

```html
<script async="async" type="module">
    import { NaperComponents } from 'https://unpkg.com/@naper/embed-components@1/dist/app.js';
    // Library configuration
</script>
```

### NPM

```bash
npm install @naper/embed-components
```

## Configuration

Before using the components, you must initialize the library with your settings:

```javascript
import { NaperComponents } from '@naper/embed-components';

NaperComponents.init({
    store: 'https://your-store.naper.ai/',
    integration: {
        type: 'vtex', // or 'shopify'
        name: 'production' // your integration name
    }
});
```

### Configuration Parameters

- **store**: URL of your Naper store (must end with `/`)
- **integration.type**: Integration type (`'vtex'` or `'shopify'`)
- **integration.name**: Name of your integration configured in Naper

## Available Components

### `<category-data>`

Displays specific data of a product category.

#### Attributes

- **data-path**: Path to the category (optional, can be used instead of `external-id`)
- **external-id**: External category ID (optional, can be used instead of `data-path`)
- **data-key**: Key of the data to display (required)
- **data**: Type of data to display (optional, can be used instead of `data-key`)

#### Available Data

- **`name`**: Category name
- **`description`**: Short category description  
- **`long_description`**: Long category description

## Usage Examples

### Displaying the Category Name

```html
<category-data 
    external-id="1000" 
    data-key="name">
</category-data>
```

### Displaying Description with Default Value

```html
<category-data 
    external-id="1000" 
    data-key="description">
    <span slot="default">
        Category not found or still loading...
    </span>
</category-data>
```

### Using Dynamic ID with JavaScript

```html
<script>
    const npGetCategoryId = () => dataLayer.findLast(item => item.event === "categoryView")?.categoryId;
</script>

<category-data
    external-id="${npGetCategoryId()}"
    data-key="name">
</category-data>
```

### Using Path to Display Category Description

```html
<category-data data-path="/category/subcategory">
    <span slot="default">
        Category not found or still loading...
    </span>
</category-data>
```

### Using the current URL path to display category description

```html
<category-data data-path="${window.location.pathname}">
    <span slot="default">
        Category not found or still loading...
    </span>
</category-data>

### Displaying Long Description

```html
<category-data 
    external-id="1000491" 
    data-key="long_description">
    <div slot="default">
        <p>Description not available at the moment.</p>
    </div>
</category-data>
```

## Default Values

To display default content when the category is not loaded or not found, use the `default` slot:

```html
<category-data external-id="1000" data-key="description">
    <span slot="default">
        A default value
    </span>
</category-data>
```

The content inside the `default` slot will be displayed:
- While the category data is loading
- When the category is not found
- In case of a request error

## Cache

The library implements automatic caching with a 5-minute TTL to optimize requests and improve performance.

## Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Store</title>

    <script async="async" type="module">
        import { NaperComponents } from 'https://unpkg.com/@naper/embed-components@1/dist/app.js';
        
        NaperComponents.init({
            store: 'https://your-store.naper.ai/',
            integration: {
                type: 'vtex',
                name: 'production'
            }
        });
    </script>
</head>
<body>
    <category-data external-id="1000" data="description">
        <h1>Category XYZ</h1>
    </category-data>
    
    <main>
        <div>
            <category-data external-id="1000" data="long_description"></category-data>
        </div>
    </main>
</body>
</html>
```

## Support

For questions or issues, please contact Naper support.
