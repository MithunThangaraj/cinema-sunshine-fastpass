// ==UserScript==
// @name         Grand Cinema Sunshine Fastpass
// @version      2.1
// @match        https://login.member.cinemasunshine.co.jp/*
// @match        https://transaction.ticket-cinemasunshine.com/*
// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @noframes
// ==/UserScript==

(function () {
    'use strict';

    const key = 'cinema-booking-retry-url';
    const url = new URL(location.href);

    // Remember the booking link for any screening.
    if (
        url.origin === 'https://login.member.cinemasunshine.co.jp' &&
        url.pathname === '/auth'
    ) {
        try {
            const redirect = new URL(url.searchParams.get('redirect_uri') || '');
            if (
                redirect.origin === 'https://transaction.ticket-cinemasunshine.com' &&
                /\/purchase\/transaction\/[^/]+\/?$/.test(redirect.pathname)
            ) {
                GM_setValue(key, location.href);
            }
        } catch {}
    }

    let retrying = false;

    function checkURL() {
        if (
            retrying ||
            location.origin !== 'https://transaction.ticket-cinemasunshine.com' ||
            location.hash.split('?')[0].replace(/\/$/, '') !== '#/congestion'
        ) return;

        const bookingURL = GM_getValue(key, '');
        try {
            const saved = new URL(bookingURL);
            if (saved.origin !== 'https://login.member.cinemasunshine.co.jp' || saved.pathname !== '/auth') return;
            const redirect = new URL(saved.searchParams.get('redirect_uri') || '');
            if (
                redirect.origin !== 'https://transaction.ticket-cinemasunshine.com' ||
                !/\/purchase\/transaction\/[^/]+\/?$/.test(redirect.pathname)
            ) return;
            retrying = true;
            location.replace(bookingURL);
        } catch {}
    }

    window.addEventListener('hashchange', checkURL);
    window.addEventListener('popstate', checkURL);
    setInterval(checkURL, 50);
    checkURL();
})();
