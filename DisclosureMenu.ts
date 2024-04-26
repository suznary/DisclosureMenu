interface DisclosureMenuOptions {
  isTouchDevice?: boolean;
}

class DisclosureMenu {
  private nav: HTMLElement;
  private primaryTrigger: HTMLElement[];
  private secondaryMenu: (HTMLElement | null)[];
  private expandedIndex: number | null;
  private isTouchDevice: boolean;
  private keyboardEventListeners: ((event: KeyboardEvent) => void)[] = [];
  private mouseEventListeners: ((event: MouseEvent) => void)[] = [];
  private touchEventListeners: ((event: TouchEvent) => void)[] = [];
  private focusEventListeners: ((event: FocusEvent) => void)[] = [];

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
    this.secondaryMenu = [];
    this.expandedIndex = null;
    this.isTouchDevice = options?.isTouchDevice ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0;

    this.primaryTrigger.forEach((trigger, index) => {
      if (trigger.hasAttribute("aria-controls")) {
        const id = trigger.getAttribute("aria-controls");
        const targetElement = document.getElementById(`${id}`);
        this.secondaryMenu[index] = targetElement;

        const keyboardEventListener = (event: KeyboardEvent) => {
          this.onKeyDownButton(event, index)
        };
        this.keyboardEventListeners[index] = keyboardEventListener;

        const touchEventListener = (event: TouchEvent) => {
          this.onTouchStartAnchor(event, index)
        };
        this.touchEventListeners[index] = touchEventListener;
        return;
      }
      
      if (trigger.classList.contains("trigger")) {
        this.secondaryMenu[index] = null;

        const mouseEventListener = () => this.onMouseEnter(index + 1);
        this.mouseEventListeners[index] = mouseEventListener;
      }

      const keyboardEventListener = (event: KeyboardEvent) => {
        this.onKeyDownAnchor(event, this.primaryTrigger)
      }
      this.keyboardEventListeners[index] = keyboardEventListener;
    })

    this.secondaryMenu.forEach((element, index) => {
      if (element !== null) {
        const focusEventListener = (event: FocusEvent) => {
          this.onFocusOut(event, element);
        }
        this.focusEventListeners[index] = focusEventListener;
      }
    });

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
          this.onKeyDownControlledElem.bind(this)
        );
        element.addEventListener(
          "focusout",
          this.focusEventListeners[index]
        );
        element.parentElement!.addEventListener(
          "mouseleave",
          this.onMouseOut.bind(this)
        );
      }
    })

    this.nav.addEventListener("focusout", (event) => {
      this.onFocusOut(event, this.nav);
    });
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
          this.onKeyDownControlledElem.bind(this)
        );
        element.removeEventListener(
          "focusout",
          this.focusEventListeners[index]
        );
        element.parentElement!.removeEventListener(
          "mouseleave",
          this.onMouseOut.bind(this)
        );
      }
    })
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

  private onMouseEnter(
    index: number,
  ): void {
    if (this.expandedIndex !== null) {
      this.toggleExpanded(this.expandedIndex, false);
    }
    this.toggleExpanded(index, true);
    this.expandedIndex = index;
  }

  private onMouseOut(): void {
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

  private onKeyDownAnchor(
    event: KeyboardEvent,
    targetArray: HTMLElement[]
  ): void {
    const activeElement = document.activeElement as HTMLElement;
    const currentIndex = targetArray.indexOf(activeElement);
    this.moveFocusByKey(event, targetArray, currentIndex);
  }
  

  private onKeyDownControlledElem(
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
        this.onKeyDownAnchor(event, targetArray);
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

  private onKeyDownButton(
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

  private onTouchStartAnchor(
    event: TouchEvent,
    index: number
  ): void {
    event.preventDefault();
    const expand =
      this.secondaryMenu[index]?.getAttribute("aria-hidden") === "true"
    this.toggleExpanded(index, expand);
    this.expandedIndex = expand ? index : null;
  }

  private onFocusOut(event: FocusEvent, targetElement: HTMLElement): void {
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
