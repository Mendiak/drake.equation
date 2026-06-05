import { translations } from './translations.js';

const _urlLang = new URLSearchParams(window.location.search).get('lang');
let currentLang = _urlLang || localStorage.getItem('drake-lang') || 'en';

function t(key) {
    const keys = key.split('.');
    let value = translations[currentLang];
    for (const k of keys) {
        if (value) value = value[k];
        else return key;
    }
    return value || key;
}

function getLocale() {
    return currentLang === 'es' ? 'es-ES' : 'en-US';
}

function initLucideIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function updateLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('drake-lang', lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerHTML = t(key);

        const tooltipKey = key + '_tooltip';
        const tooltipText = t(tooltipKey);
        if (tooltipText !== tooltipKey) {
            el.setAttribute('title', tooltipText);
        }
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
        el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria-label')));
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
    });

    document.querySelectorAll('.info-icon').forEach(icon => {
        icon.setAttribute('aria-label', t('info_icon_label'));
        icon.setAttribute('title', t('info_icon_label'));
    });

    initLucideIcons();
}

export { t, getLocale, currentLang, updateLanguage, initLucideIcons };
