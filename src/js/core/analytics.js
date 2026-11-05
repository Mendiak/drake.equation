/**
 * Analytics helpers.
 *
 * The GA4 tag is only loaded on the production host (see the gtag block in
 * index.html), so every call here is a no-op on localhost, previews and when a
 * content blocker is active. That keeps the production property clean without
 * scattering hostname checks through the app.
 */

/** Send a GA4 event. Silently ignored when analytics is unavailable. */
export function track(eventName, params = {}) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, params);
}

/** Collapse a burst of calls into a single trailing call. */
export function debounce(fn, wait) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), wait);
    };
}
