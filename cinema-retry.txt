// ==UserScript==
// @name         Cinema Sunshine Fastpass
// @namespace    https://github.com/MithunThangaraj/cinema-sunshine-fastpass
// @version      1.1
// @description  Retry the current booking page every 10 seconds. Stop at seat selection.
// @match        https://transaction.ticket-cinemasunshine.com/*
// @run-at       document-idle
// @grant        GM_notification
// @noframes
// ==/UserScript==

(() => {
  'use strict';
  // Uses the current page only. No member tokens or booking URLs are stored.
  const KEY = 'cinema-retry-v1';
  const INTERVAL = 10000;
  const MAX_TIME = 30 * 60 * 1000;
  let state;
  try { state = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch {}
  let active = !!state && Number.isFinite(state.until) && state.until > Date.now()
    && Number.isFinite(state.startAt) && state.page === location.pathname;
  let due = Date.now() + INTERVAL;
  if (active && state.startAt > Date.now()) due = state.startAt;
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:2147483647;background:#16202b;color:white;padding:16px;border:2px solid #70cfb1;border-radius:12px;font:14px/1.5 sans-serif;max-width:320px;box-shadow:0 3px 16px #0006';
  const label = document.createElement('div');
  const scheduleLabel = document.createElement('label');
  scheduleLabel.textContent = 'Optional start time (Japan time)';
  scheduleLabel.style.cssText = 'display:block;margin-top:10px';
  const schedule = document.createElement('input');
  schedule.type = 'datetime-local';
  schedule.style.cssText = 'display:block;margin-top:4px;color:black;background:white';
  scheduleLabel.append(schedule);
  const button = document.createElement('button');
  button.style.cssText = 'margin-top:10px;padding:8px 15px;cursor:pointer;background:#a7f3d0;color:#10251b;border:0;border-radius:6px;font-weight:bold';
  box.append(label, scheduleLabel, button);
  document.body.append(box);

  function save() {
    try {
      if (active) sessionStorage.setItem(KEY, JSON.stringify(state));
      else sessionStorage.removeItem(KEY);
      return true;
    } catch {
      active = false;
      label.textContent = 'Tab storage unavailable. Retries stopped.';
      button.textContent = 'Start retries';
      schedule.disabled = false;
      return false;
    }
  }
  function stop(message) {
    active = false;
    if (!save()) return;
    label.textContent = message;
    button.textContent = 'Start retries';
    schedule.disabled = false;
  }
  function guard() {
    const route = location.hash.split('?')[0].replace(/\/$/, '');
    if (route === '#/purchase/seat') return 'success';
    // Never refresh another purchase step (ticket types, checkout, etc.).
    if (/^#\/purchase\//.test(route)) return 'Booking step detected — paused.';
    if (/login|sign.?in|auth/i.test(location.pathname + location.hash)) return 'Login detected — paused.';
    if (/\/purchase\/(seat|ticket|payment|checkout|confirm|complete)(\/|$)/i.test(location.pathname)) return 'Booking step detected — paused.';
    const visible = el => el.getClientRects().length > 0;
    if ([...document.querySelectorAll('input[type="password"], iframe[src*="captcha"], iframe[src*="challenges.cloudflare.com"], .g-recaptcha, .h-captcha, .cf-turnstile')].some(visible)) return 'Login or verification detected — paused.';
    const text = [...document.body.children].filter(el => el !== box && !['SCRIPT', 'STYLE'].includes(el.tagName)).map(el => el.innerText || '').join('\n');
    if (/waiting room|you are in (a |the )?queue|your (position|place) in|queue position|do not (refresh|reload)|順番待ち|待合室|待機列|更新しない|再読み込みしない|更新しないで|順番にご案内|そのままお待ち/i.test(text)) return 'Waiting queue detected — paused. Follow the page instructions.';
    if (/verify (you are|that you are) human|checking your browser|security verification|人間であること|ロボットではない/i.test(text)) return 'Verification detected — paused.';
    if (/session (has )?expired|token (has )?expired|セッション.{0,12}(切れ|期限)|ログインし直|再ログイン|認証.{0,8}期限/i.test(text)) return 'Session expired — paused. Reopen the original booking link.';
    return '';
  }
  function check() {
    if (!active) return;
    const reason = guard();
    if (reason === 'success') {
      stop('Seat page reached! Refreshing stopped.');
      document.title = 'SEATS OPEN — ' + document.title;
      try { GM_notification({title:'Cinema Sunshine', text:'Seat page reached. Refreshing stopped.', timeout:0}); } catch {}
      return;
    }
    if (reason) { stop(reason); return; }
    if (Date.now() >= state.until) { stop('30-minute limit reached — paused.'); return; }
    if (Date.now() < state.startAt) {
      label.textContent = 'Waiting until ' + new Date(state.startAt).toLocaleString('en-GB', {timeZone:'Asia/Tokyo'}) + ' JST';
      button.textContent = 'Pause retries';
      return;
    }
    label.textContent = 'Retrying in ' + Math.max(0, Math.ceil((due - Date.now()) / 1000)) + 's. Stops at seat selection.';
    button.textContent = 'Pause retries';
    if (Date.now() >= due) {
      due = Infinity;
      location.reload();
    }
  }
  button.addEventListener('click', () => {
    if (active) { stop('Paused.'); return; }
    const startAt = schedule.value ? Date.parse(schedule.value + '+09:00') : Date.now();
    if (!Number.isFinite(startAt)) {
      label.textContent = 'Choose a valid start time.';
      return;
    }
    active = true;
    state = {startAt:Math.max(Date.now(), startAt), until:Math.max(Date.now(), startAt) + MAX_TIME, page:location.pathname};
    due = startAt > Date.now() ? startAt : Date.now() + INTERVAL;
    if (!save()) return;
    schedule.disabled = true;
    check();
  });
  if (!active) stop('Ready — press Start retries on the booking entry page.');
  else schedule.disabled = true;
  window.addEventListener('hashchange', check);
  window.addEventListener('popstate', check);
  setInterval(check, 250);
  check();
})();
