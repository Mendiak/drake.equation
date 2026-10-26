import { translations } from './translations.js';

const PAGE_LANG = window.__DRAKE_LANG__ || (document.documentElement.lang === 'es' ? 'es' : 'en');
const _params = new URLSearchParams(window.location.search);
const _urlLang = _params.get('lang');

// Legacy/param URLs (?lang=es) now have their own static page: redirect once.
if ((_urlLang === 'en' || _urlLang === 'es') && _urlLang !== PAGE_LANG) {
    const target = new URL(PAGE_LANG === 'es' ? '../' : './es/', window.location.href);
    _params.delete('lang');
    target.search = _params.toString();
    window.location.replace(target.toString());
}

let currentLang = PAGE_LANG;

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
    document.documentElement.lang = lang;

    document.querySelectorAll('.lang-btn').forEach(btn => {
        const isActive = btn.getAttribute('data-lang') === lang;
        btn.classList.toggle('active', isActive);
        if (isActive) btn.setAttribute('aria-current', 'page');
        else btn.removeAttribute('aria-current');
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

    document.querySelectorAll('.info-icon[data-param]').forEach(icon => {
        icon.setAttribute('aria-label', t('info_icon_label'));
        icon.setAttribute('title', t('info_icon_label'));
    });

    document.querySelectorAll('.confidence-indicator[data-confidence]').forEach(indicator => {
        const item = indicator.closest('.confidence-item');
        const param = item ? item.querySelector('.confidence-label')?.textContent.trim() : '';
        const level = t('confidence_' + indicator.getAttribute('data-confidence'));
        indicator.setAttribute('aria-label', param ? `${param}: ${level}` : level);
    });

    initLucideIcons();
}

export { t, getLocale, currentLang, updateLanguage, initLucideIcons };
