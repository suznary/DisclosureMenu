[[日本語版はこちら](./README.ja.md)]

# DisclosureMenu
The `DisclosureMenu` class is a customizable, accessible navigation menu management system for web applications. This class provides dynamic handling of dropdown or expanding menus often used in navigation bars, particularly suited for responsive designs that need to accommodate touch and non-touch devices.

## Features
- **Accessibility**: Implements WAI-ARIA attributes to improve accessibility.
- **Touch & Keyboard Support**: Handles both touch and keyboard interactions.
- **Dynamic State Management**: Automatically manages the expanded and collapsed states of menu items.

## Installation
To integrate the `DisclosureMenu` into your project, include the class file in your project and use it as a module.

```javascript
import DisclosureMenu from './path/to/DisclosureMenu';
```

## Usage

### HTML Structure
Your HTML should include a parent navigation element and child elements that can trigger the expansion. Each trigger must have an `aria-controls` attribute pointing to the ID of the menu it controls.

```html
<nav id="disclosure-nav" aria-label="Global Navigation">
  <ul>
    <li>
      <a class="primary-link" href="#">Menu 1</a>
    </li>
    <li>
      <a class="primary-link" href="#">Menu 2</a>
      <button type="button" aria-expanded="false" aria-controls="submenu1">
        <span class="visually-hidden">Open submenu</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z" fill="black" />
        </svg>
      </button>
      <ul id="submenu1" aria-hidden="true">
        <li>
          <a href="#" tabindex="-1">Sub-item 1</a>
        </li>
        <li>
          <a href="#" tabindex="-1">Sub-item 2</a>
        </li>
      </ul>
    </li>
  </ul>
</nav>
```

### JavaScript
Instantiate the `DisclosureMenu` by passing the navigation element and optional configuration options.

```javascript
const navMenu = new DisclosureMenu(document.getElementById('disclosure-nav'), {
  isTouchDevice: true // Optional: force touch device behavior
});
```

## Configuration Options
The `DisclosureMenu` constructor accepts an optional `options` object with the following properties:

- **isTouchDevice** (boolean): Manually set if the device is a touch device (overrides automatic detection).

## メソッド
### detachAll()
The `DisclosureMenu` class provides methods for adding and managing event listeners on specified HTML elements. This class allows you to monitor click events on these elements and apply specific actions to each.

- **Preventing Memory Leaks**: Prevents old listeners from lingering in memory when they are no longer needed, or when parts of the page are dynamically removed.
- **Improving Performance**: Enhances page performance by removing unnecessary event listeners.

#### Usage Example
```javascript
const navMenu = new DisclosureMenu(document.getElementById('disclosure-nav'));

// When you need to remove all event listeners after certain operations
navMenu.detachAll();
```

#### ※Attention
When using this class, do not forget to call the detachAll method at appropriate times. It is recommended to execute this as part of resource cleanup when the component is no longer needed.

## Events
The `DisclosureMenu` class handles various events such as `keydown`, `mouseenter`, and `focusout` to provide a robust user interaction model.

## Browser Compatibility
Ensure that your target browsers support the JavaScript features used in this class, such as `querySelectorAll`, `addEventListener`, `classList`, and others typically supported in modern browsers.

## License

MIT @ muro

## Note
This document was prepared by ChatGPT.