interface DisclosureMenuOptions {
  isTouchDevice?: boolean;
}

class DisclosureMenu {
  private nav: HTMLElement;
  private primaryTrigger: HTMLElement[] = [];
  private secondaryMenu: (HTMLElement | null)[] = [];
  private expandedIndex: number | null = null;
  private isTouchDevice: boolean = false;
  private keyboardEventListeners: ((event: KeyboardEvent) => void)[] = [];
  private mouseEventListeners: ((event: MouseEvent) => void)[] = [];
  private touchEventListeners: ((event: TouchEvent) => void)[] = [];
  private focusOutListenersForSecondaryMenu: ((event: FocusEvent) => void)[] = [];
  private focusOutListenersForNavigation: (event: FocusEvent) => void;

  constructor(
    nav: HTMLElement,
    options?: DisclosureMenuOptions
  ) {
    this.nav = nav;
    this.primaryTrigger = Array.from(
      this.nav.querySelectorAll<HTMLElement>(
        "a.primary-link, button[aria-controls]"
      )
    );
    this.isTouchDevice = options?.isTouchDevice ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0;

    this.primaryTrigger.forEach((trigger, index) => {
      if (trigger.hasAttribute("aria-controls")) {
        const id = trigger.getAttribute("aria-controls");
        const targetElement = document.getElementById(`${id}`);
        this.secondaryMenu[index] = targetElement;

        const keyboardEventListener = (event: KeyboardEvent) => {
          this.handleKeyDownOnButton(event, index)
        };
        this.keyboardEventListeners[index] = keyboardEventListener;

        const touchEventListener = (event: TouchEvent) => {
          this.handleTouchStartOnButton(event, index)
        };
        this.touchEventListeners[index] = touchEventListener;
        return;
      }
      
      if (trigger.classList.contains("trigger")) {
        this.secondaryMenu[index] = null;

        const mouseEventListener = () => this.handleMouseEnter(index + 1);
        this.mouseEventListeners[index] = mouseEventListener;
      }

      const keyboardEventListener = (event: KeyboardEvent) => {
        this.handleKeyDownOnAnchor(event, this.primaryTrigger)
      }
      this.keyboardEventListeners[index] = keyboardEventListener;
    });

    this.secondaryMenu.forEach((element, index) => {
      if (element !== null) {
        const focusEventListener = (event: FocusEvent) => {
          this.handleFocusOutFromNavigation(event, element);
        }
        this.focusOutListenersForSecondaryMenu[index] = focusEventListener;
      }
    });

    this.focusOutListenersForNavigation = (event: FocusEvent) => {
      this.handleFocusOutFromNavigation(event, this.nav);
    }

    this.initEventListeners();
  }
  
  private initEventListeners(): void {
    this.primaryTrigger.forEach((trigger, index) => {
      if (trigger.hasAttribute("aria-controls")) {
        trigger.addEventListener(
          "keydown",
          this.keyboardEventListeners[index]
        );
        if (this.isTouchDevice) {
          trigger.addEventListener(
            "touchstart",
            this.touchEventListeners[index]
          );
        }
        return;
      }
      
      if (trigger.classList.contains("trigger")) {
        trigger.addEventListener(
          "mouseenter",
          this.mouseEventListeners[index]
        );
      }

      trigger.addEventListener(
        "keydown",
        this.keyboardEventListeners[index]
      )  
    })

    this.secondaryMenu.forEach((element, index) => {
      if (element !== null) {
        element.addEventListener(
          "keydown",
          this.handleKeyDownOnSecondaryMenu.bind(this)
        );
        element.addEventListener(
          "focusout",
          this.focusOutListenersForSecondaryMenu[index]
        );
        element.parentElement!.addEventListener(
          "mouseleave",
          this.handleMouseLeave.bind(this)
        );
      }
    })

    this.nav.addEventListener(
      "focusout",
      this.focusOutListenersForNavigation
    );
  }

  /**
   * detachAll
   * This method removes event listeners from all HTMLElement held by the class.
   */
  public detachAll() {
    this.primaryTrigger.forEach((trigger, index) => {
      if (trigger.hasAttribute("aria-controls")) {
        trigger.removeEventListener(
          "keydown",
          this.keyboardEventListeners[index]
        );
        if (this.isTouchDevice) {
          trigger.removeEventListener(
            "touchstart",
            this.touchEventListeners[index]
          );
        }
        return;
      }
      
      if (trigger.classList.contains("trigger")) {
        trigger.removeEventListener(
          "mouseenter",
          this.mouseEventListeners[index]
        );
      }

      trigger.removeEventListener(
        "keydown",
        this.keyboardEventListeners[index]
      )  
    })

    this.secondaryMenu.forEach((element, index) => {
      if (element !== null) {
        element.removeEventListener(
          "keydown",
          this.handleKeyDownOnSecondaryMenu
        );
        element.removeEventListener(
          "focusout",
          this.focusOutListenersForSecondaryMenu[index]
        );
        element.parentElement!.removeEventListener(
          "mouseleave",
          this.handleMouseLeave
        );
      }
    })

    this.nav.removeEventListener(
      "focusout",
      this.focusOutListenersForNavigation
    );
  }

  private setAriaAttribute(
    index: number,
    expand: boolean
  ): void {
    const expanded = expand ? "true" : "false";
    const hidden = !expand ? "true" : "false";
    this.primaryTrigger[index].setAttribute("aria-expanded", expanded);
    this.secondaryMenu[index]?.setAttribute("aria-hidden", hidden);
  }

  private changeTabIndex(
    index: number,
    expand: boolean
  ): void {
    const tabIndexValue = expand ? "0" : "-1";
    const anchors = Array.from(
      this.secondaryMenu[index]!.querySelectorAll<HTMLElement>("a")
    );
    anchors.forEach((a) => {
      a.setAttribute("tabindex", tabIndexValue);
    });
  }

  private toggleExpanded(
    index: number,
    expand: boolean
  ): void {
    this.setAriaAttribute(index, expand);
    this.changeTabIndex(index, expand);
  }

/**
 * handleMouseEnter
 * Handles the mouse entering an anchor element of the primary trigger.
 * If there is a secondary menu associated with another primary trigger, it is hidden.
 * The secondary menu associated with the current primary trigger is displayed.
 *
 * @param {number} index - The index of the primary trigger in the array
 */
  private handleMouseEnter(
    index: number,
  ): void {
    if (this.expandedIndex !== null && this.secondaryMenu[index] !== null) {
      this.toggleExpanded(this.expandedIndex, false);
    }
    this.toggleExpanded(index, true);
    this.expandedIndex = index;
  }

/**
 * handleMouseLeave
 * Handles the mouse leaving a secondary menu element.
 * If there is a displayed secondary menu, it is hidden.
 */
  private handleMouseLeave(): void {
    if (this.expandedIndex !== null) {
      this.toggleExpanded(this.expandedIndex, false);
      this.expandedIndex = null;
    }
  }

  private moveFocusByKey(
    event: KeyboardEvent,
    elementArray: HTMLElement[],
    currentIndex: number
  ): void {
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        if (currentIndex > 0) {
          elementArray[currentIndex - 1].focus();
        }
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        if (currentIndex < elementArray.length - 1) {
          elementArray[currentIndex + 1].focus();
        }
        break;
      case 'Home':
        elementArray[0].focus();
        break;
      case 'End':
        elementArray[elementArray.length - 1].focus();
        break;
    }
  }

/**
 * handleKeyDownOnAnchor
 * Handles a key press on anchor element.
 * If an arrow key is pressed, the focus moves between the primary trigger and secondary menu anchors.
 *
 * @param {KeyboardEvent} event - The keyboard event object
 * @param {HTMLElement[]} targetArray - The array of elements to move focus between
 */
  private handleKeyDownOnAnchor(
    event: KeyboardEvent,
    targetArray: HTMLElement[]
  ): void {
    const activeElement = document.activeElement as HTMLElement;
    const currentIndex = targetArray.indexOf(activeElement);
    this.moveFocusByKey(event, targetArray, currentIndex);
  }

/**
 * handleKeyDownOnSecondaryMenu
 * Handles a key press within the secondary menu.
 * If the Escape key is pressed, focus is moved to the associated primary trigger, and the secondary menu is hidden.
 * If an arrow key is pressed, focus is moved between the links within the secondary menu.
 *
 * @param {KeyboardEvent} event - The keyboard event object
 */

  private handleKeyDownOnSecondaryMenu(
    event: KeyboardEvent
  ) {
    if (
      this.expandedIndex !== null &&
      this.secondaryMenu[this.expandedIndex] !== null
    ) {
      if (event.key === "Escape") {
        this.primaryTrigger[this.expandedIndex].focus();
        this.toggleExpanded(this.expandedIndex, false);
        this.expandedIndex = null;
      } else {
        const targetArray = Array.from(
          this.secondaryMenu[this.expandedIndex]!.querySelectorAll<HTMLElement>('a')
        );
        this.handleKeyDownOnAnchor(event, targetArray);
      }
    }
  }

  private toggleExpandedByKey(
    index: number,
  ): void {
    if (index === this.expandedIndex) {
      this.toggleExpanded(this.expandedIndex, false);
      this.expandedIndex = null;
      return;
    }
    if (this.expandedIndex !== null) {
      this.toggleExpanded(this.expandedIndex, false);
    }
    this.toggleExpanded(index, true);
    this.expandedIndex = index;
  }
  
  private focusSecondaryMenu(
    event: KeyboardEvent,
    index: number
  ): void {
    if (this.expandedIndex !== null && this.expandedIndex === index) {
      this.secondaryMenu[this.expandedIndex]?.querySelector("a")?.focus();
    } else {
      this.moveFocusByKey(event, this.primaryTrigger, index);
    }
  }

/**
 * handleKeyDownOnButton
 * Handles a key press on a button-type primary trigger.
 * If the Enter or Space key is pressed, the associated secondary menu is toggled between visible and hidden.
 * If an arrow key is pressed, focus is moved to the associated secondary menu or between the primary triggers.
 *
 * @param {KeyboardEvent} event - The keyboard event object
 * @param {number} index - The index of the primary trigger in the array
 */
  private handleKeyDownOnButton(
    event: KeyboardEvent,
    index: number
  ): void {
    if (event.key === "Enter" || event.key === " ") {
      this.toggleExpandedByKey(index);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      this.focusSecondaryMenu(event, index);
    } else {
      this.moveFocusByKey(event, this.primaryTrigger, index);
    }
  }

/**
 * handleTouchStartOnButton
 * Handles a touch start event on a button-type primary trigger.
 * The associated secondary menu is toggled between visible and hidden.
 *
 * @param {TouchEvent} event - The touch event object
 * @param {number} index - The index of the primary trigger in the array
 */
  private handleTouchStartOnButton(
    event: TouchEvent,
    index: number
  ): void {
    event.preventDefault();
    const expand =
      this.secondaryMenu[index]?.getAttribute("aria-hidden") === "true"
    this.toggleExpanded(index, expand);
    this.expandedIndex = expand ? index : null;
  }

/**
 * handleFocusOutEvent
 * Handles the focus leaving a specific element.
 * If the focus remains within the element, no action is taken.
 * If the focus moves outside the element, any displayed secondary menu is hidden.
 *
 * @param {FocusEvent} event - The focus event object
 * @param {HTMLElement} targetElement - The element that lost focus
 */
  private handleFocusOutFromNavigation(
    event: FocusEvent,
    targetElement: HTMLElement
  ): void {
    const isFocusInTarget = targetElement.contains(
      event.relatedTarget as Node | null
    );
    if (!isFocusInTarget && this.expandedIndex !== null) {
      this.toggleExpanded(this.expandedIndex, false);
      this.expandedIndex = null;
    }
  }
}
export default DisclosureMenu;
