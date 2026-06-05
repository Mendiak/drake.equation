import { initLucideIcons } from './i18n.js';

function toggleDisclaimer() {
    const overlay = document.getElementById('disclaimer-overlay');
    if (!overlay) return;
    const isActive = overlay.classList.toggle('active');
    document.body.style.overflow = isActive ? 'hidden' : '';
    if (isActive) initLucideIcons();
}

function handleDisclaimerKeydown(e) {
    if (e.key === 'Escape') {
        const overlay = document.getElementById('disclaimer-overlay');
        if (overlay && overlay.classList.contains('active')) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
}

document.addEventListener('keydown', handleDisclaimerKeydown);

export { toggleDisclaimer };
