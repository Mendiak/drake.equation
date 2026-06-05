import { t, getLocale, currentLang } from './i18n.js';
import { translations } from './translations.js';

let cachedExoplanetData = null;
let lastFetchTime = null;
let currentExoplanetIndex = -1;

const NASA_API_BASE = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync';
const CORS_PROXY = 'https://corsproxy.io/?';

const FEATURED_EXOPLANETS = [
    {
        pl_name: 'TRAPPIST-1 e',
        host_name: 'TRAPPIST-1',
        pl_discmethod: 'Transit',
        pl_orbper: 6.10,
        pl_radj: 0.92,
        pl_bmasse: 0.77,
        discoveryyear: 2017,
        pl_eqt: 251,
        habitable: true
    },
    {
        pl_name: 'Kepler-452 b',
        host_name: 'Kepler-452',
        pl_discmethod: 'Transit',
        pl_orbper: 384.8,
        pl_radj: 1.63,
        pl_bmasse: 5.0,
        discoveryyear: 2015,
        pl_eqt: 265,
        habitable: true
    },
    {
        pl_name: 'Proxima Centauri b',
        host_name: 'Proxima Centauri',
        pl_discmethod: 'Radial Velocity',
        pl_orbper: 11.19,
        pl_radj: 1.1,
        pl_bmasse: 1.27,
        discoveryyear: 2016,
        pl_eqt: 234,
        habitable: true
    },
    {
        pl_name: 'K2-18 b',
        host_name: 'K2-18',
        pl_discmethod: 'Transit',
        pl_orbper: 32.94,
        pl_radj: 2.6,
        pl_bmasse: 8.6,
        discoveryyear: 2015,
        pl_eqt: 285,
        habitable: true
    },
    {
        pl_name: 'TOI-715 b',
        host_name: 'TOI-715',
        pl_discmethod: 'Transit',
        pl_orbper: 19.0,
        pl_radj: 1.55,
        pl_bmasse: 3.5,
        discoveryyear: 2024,
        pl_eqt: 273,
        habitable: true
    },
    {
        pl_name: '55 Cancri e',
        host_name: '55 Cancri A',
        pl_discmethod: 'Radial Velocity',
        pl_orbper: 0.74,
        pl_radj: 2.0,
        pl_bmasse: 8.6,
        discoveryyear: 2004,
        pl_eqt: 2573,
        habitable: false
    },
    {
        pl_name: 'HD 40307 g',
        host_name: 'HD 40307',
        pl_discmethod: 'Radial Velocity',
        pl_orbper: 197.8,
        pl_radj: 2.4,
        pl_bmasse: 7.1,
        discoveryyear: 2012,
        pl_eqt: 230,
        habitable: true
    },
    {
        pl_name: 'Gliese 667 Cc',
        host_name: 'Gliese 667 C',
        pl_discmethod: 'Radial Velocity',
        pl_orbper: 28.15,
        pl_radj: 1.54,
        pl_bmasse: 4.5,
        discoveryyear: 2011,
        pl_eqt: 277,
        habitable: true
    },
    {
        pl_name: 'LHS 1140 b',
        host_name: 'LHS 1140',
        pl_discmethod: 'Transit',
        pl_orbper: 24.74,
        pl_radj: 1.73,
        pl_bmasse: 5.6,
        discoveryyear: 2017,
        pl_eqt: 230,
        habitable: true
    },
    {
        pl_name: 'Wolf 1069 b',
        host_name: 'Wolf 1069',
        pl_discmethod: 'Radial Velocity',
        pl_orbper: 15.56,
        pl_radj: 1.08,
        pl_bmasse: 1.26,
        discoveryyear: 2023,
        pl_eqt: 250,
        habitable: true
    }
];

const NASA_LATEST_VALUES = {
    total: 5800,
    habitable: 60
};

async function fetchNasaExoplanetData() {
    const totalEl = document.getElementById('nasa-total-exoplanets');
    const habitableEl = document.getElementById('nasa-habitable-candidates');

    const now = Date.now();
    if (cachedExoplanetData && lastFetchTime && (now - lastFetchTime < 3600000)) {
        updateCounterDisplay(cachedExoplanetData.total, cachedExoplanetData.habitable);
        return;
    }

    const fallbackTotal = NASA_LATEST_VALUES.total;
    const fallbackHabitable = NASA_LATEST_VALUES.habitable;

    let apiTotal = null;
    try {
        const query = 'SELECT COUNT(*) FROM PSCompPars';
        const nasaUrl = `${NASA_API_BASE}?query=${encodeURIComponent(query)}&format=json`;
        const url = `${CORS_PROXY}${encodeURIComponent(nasaUrl)}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            apiTotal = parseInt(data[0]?.['count(*)']);
        }
    } catch (error) {
        console.log('NASA API unavailable, using fallback');
    }

    const finalTotal = (apiTotal && !isNaN(apiTotal)) ? apiTotal : fallbackTotal;

    cachedExoplanetData = {
        total: finalTotal,
        habitable: fallbackHabitable
    };
    lastFetchTime = now;

    animateCounter(totalEl, 0, cachedExoplanetData.total, 2000);
    animateCounter(habitableEl, 0, cachedExoplanetData.habitable, 2000);

    if (apiTotal && apiTotal > fallbackTotal) {
        console.log(`NASA API: ${apiTotal} exoplanets found`);
    }
}

function animateCounter(element, start, end, duration) {
    if (!element) return;

    const startTime = performance.now();
    const isLargeNumber = end > 1000;

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (end - start) * easeProgress);

        element.textContent = isLargeNumber
            ? current.toLocaleString(getLocale())
            : current.toString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function updateCounterDisplay(total, habitable) {
    const totalEl = document.getElementById('nasa-total-exoplanets');
    const habitableEl = document.getElementById('nasa-habitable-candidates');

    if (totalEl) totalEl.textContent = total.toLocaleString(getLocale());
    if (habitableEl) habitableEl.textContent = habitable.toLocaleString(getLocale());
}

function loadRandomExoplanet() {
    const contentEl = document.getElementById('exoplanet-content');
    if (!contentEl) return;

    contentEl.innerHTML = `
        <div class="exoplanet-loading">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        </div>
    `;

    setTimeout(() => {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * FEATURED_EXOPLANETS.length);
        } while (newIndex === currentExoplanetIndex && FEATURED_EXOPLANETS.length > 1);

        currentExoplanetIndex = newIndex;
        displayExoplanet(FEATURED_EXOPLANETS[newIndex]);
    }, 300);
}

function displayExoplanet(planet) {
    const contentEl = document.getElementById('exoplanet-content');
    if (!contentEl) return;

    const tObj = translations[currentLang];

    const discoveryMethod = formatDiscoveryMethod(planet.pl_discmethod);
    const orbitalPeriod = planet.pl_orbper ? `${parseFloat(planet.pl_orbper).toFixed(1)} ${tObj.exoplanet_day_unit}` : '?';
    const radius = planet.pl_radj ? `${parseFloat(planet.pl_radj).toFixed(2)} R⊕` : '?';
    const mass = planet.pl_bmasse ? `${parseFloat(planet.pl_bmasse).toFixed(1)} M⊕` : '?';
    const temp = planet.pl_eqt ? `${Math.round(planet.pl_eqt)} K` : '?';

    contentEl.innerHTML = `
        <div class="exoplanet-info">
            <div class="exoplanet-name">${planet.pl_name}</div>
            <div class="exoplanet-host">${tObj.exoplanet_star_label} ${planet.host_name}</div>

            <div class="exoplanet-stats">
                <div class="exoplanet-stat">
                    <span class="exoplanet-stat-label">${tObj.exoplanet_year_label}</span>
                    <span class="exoplanet-stat-value">${planet.discoveryyear}</span>
                </div>
                <div class="exoplanet-stat">
                    <span class="exoplanet-stat-label">${tObj.exoplanet_method_label}</span>
                    <span class="exoplanet-stat-value">${discoveryMethod}</span>
                </div>
                <div class="exoplanet-stat">
                    <span class="exoplanet-stat-label">${tObj.exoplanet_orbit_label}</span>
                    <span class="exoplanet-stat-value">${orbitalPeriod}</span>
                </div>
                <div class="exoplanet-stat">
                    <span class="exoplanet-stat-label">${tObj.exoplanet_radius_label}</span>
                    <span class="exoplanet-stat-value">${radius}</span>
                </div>
                <div class="exoplanet-stat">
                    <span class="exoplanet-stat-label">${tObj.exoplanet_mass_label}</span>
                    <span class="exoplanet-stat-value">${mass}</span>
                </div>
                <div class="exoplanet-stat">
                    <span class="exoplanet-stat-label">${tObj.exoplanet_temp_label}</span>
                    <span class="exoplanet-stat-value">${temp}</span>
                </div>
            </div>

            ${planet.habitable
                ? `<div class="exoplanet-habitable-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>
                    ${tObj.exoplanet_habitable_zone}
                </div>`
                : ''
            }
        </div>
    `;

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function formatDiscoveryMethod(method) {
    const methods = translations[currentLang].exoplanet_discovery_methods;
    return methods[method] || method || '?';
}

function updateExoplanetLanguage() {
    if (currentExoplanetIndex >= 0) {
        displayExoplanet(FEATURED_EXOPLANETS[currentExoplanetIndex]);
    }
}

export { fetchNasaExoplanetData, loadRandomExoplanet, updateExoplanetLanguage };
