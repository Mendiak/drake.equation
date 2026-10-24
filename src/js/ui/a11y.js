const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
].join(', ');

export function getFocusable(container) {
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR))
        .filter(el => el.getClientRects().length > 0 && el.getAttribute('aria-hidden') !== 'true');
}

/**
 * Keep keyboard focus inside a modal dialog when the user presses Tab.
 * Call from a keydown listener while the dialog is open.
 */
export function trapFocus(container, event) {
    if (event.key !== 'Tab') return;

    const items = getFocusable(container);
    if (items.length === 0) {
        event.preventDefault();
        return;
    }

    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;

    if (event.shiftKey) {
        if (active === first || !container.contains(active)) {
            event.preventDefault();
            last.focus();
        }
    } else if (active === last || !container.contains(active)) {
        event.preventDefault();
        first.focus();
    }
}
