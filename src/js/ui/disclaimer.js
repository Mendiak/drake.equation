import { initLucideIcons } from '../i18n/i18n.js';
import { trapFocus } from './a11y.js';

let lastTrigger = null;

function openDisclaimer() {
    const overlay = document.getElementById('disclaimer-overlay');
    if (!overlay) return;
    lastTrigger = document.activeElement;
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    initLucideIcons();
    const closeBtn = overlay.querySelector('.disclaimer-close');
    if (closeBtn) closeBtn.focus();
}

function closeDisclaimer() {
    const overlay = document.getElementById('disclaimer-overlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
    lastTrigger = null;
}

function toggleDisclaimer() {
    const overlay = document.getElementById('disclaimer-overlay');
    if (!overlay) return;
    if (overlay.classList.contains('active')) closeDisclaimer();
    else openDisclaimer();
}

function handleDisclaimerKeydown(e) {
    const overlay = document.getElementById('disclaimer-overlay');
    if (!overlay || !overlay.classList.contains('active')) return;

    if (e.key === 'Escape') {
        closeDisclaimer();
        return;
    }

    const modal = overlay.querySelector('.disclaimer-modal');
    if (modal) trapFocus(modal, e);
}

document.addEventListener('keydown', handleDisclaimerKeydown);

export { toggleDisclaimer };
