const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../cinema-retry.user.js'), 'utf8');

function tab({store = new Map(), now = Date.parse('2026-10-27T11:59:00Z'), hash = '', text = '', path = '/projects/test/purchase/transaction/123', storageFails = false} = {}) {
  let clock = now, reloads = 0, interval;
  const notifications = [], listeners = {};
  class Element {
    constructor(tag) { this.tagName = tag.toUpperCase(); this.children = []; this.style = {}; this.value = ''; }
    append(...els) { this.children.push(...els); }
    addEventListener(event, fn) { this[event] = fn; }
    getClientRects() { return [1]; }
  }
  const body = new Element('body');
  const content = new Element('main'); content.innerText = text; body.append(content);
  const controls = [];
  const document = {body, title:'Booking', createElement: tag => new Element(tag), querySelectorAll: () => controls};
  const location = {pathname:path, hash, reload() { reloads++; }};
  class Clock extends Date { static now() { return clock; } }
  const sessionStorage = {
    getItem: key => store.get(key) || null,
    setItem: (key, val) => { if (storageFails) throw Error('storage'); store.set(key, val); },
    removeItem: key => { if (storageFails) throw Error('storage'); store.delete(key); }
  };
  const context = {document, location, sessionStorage, Date:Clock, GM_notification: n => notifications.push(n),
    window:{addEventListener:(e, fn) => { listeners[e] = fn; }}, setInterval:fn => { interval = fn; }};
  vm.runInNewContext(source, context);
  const box = body.children[1], label = box.children[0], schedule = box.children[1].children[1].children[0], button = box.children[2];
  return {store, document, location, content, controls, notifications, label, schedule,
    click: () => button.click(), tick(ms = 0) { clock += ms; interval(); },
    get reloads() { return reloads; }, get now() { return clock; }};
}

test('starts manually, waits 10 seconds, and resumes after a reload', () => {
  const t = tab(); t.tick(20000); assert.equal(t.reloads, 0);
  t.click(); t.tick(9999); assert.equal(t.reloads, 0);
  t.tick(1); assert.equal(t.reloads, 1);
  const next = tab({store:t.store, now:t.now}); next.tick(10000);
  assert.equal(next.reloads, 1);
});

test('seat route stops and notifies before a scheduled refresh', () => {
  const t = tab(); t.click(); t.location.hash = '#/purchase/seat?screen=12'; t.tick(10000);
  assert.equal(t.reloads, 0); assert.equal(t.notifications.length, 1);
  assert.equal(t.store.size, 0); t.tick(20000); assert.equal(t.notifications.length, 1);
});

test('pauses for queues, login, verification and expired sessions', () => {
  for (const text of ['You are in the queue', 'Do not reload', '待合室', 'そのままお待ちください', 'Session has expired', 'セッションの期限切れ', 'Verify you are human']) {
    const t = tab({text}); t.click(); t.tick(10000);
    assert.equal(t.reloads, 0, text); assert.equal(t.store.size, 0, text);
  }
  for (const hash of ['#/purchase/ticket', '#/purchase/payment', '#/login']) {
    const t = tab({hash}); t.click(); t.tick(10000); assert.equal(t.reloads, 0, hash);
  }
  const t = tab(); t.controls.push({getClientRects:() => [1]}); t.click(); t.tick(10000);
  assert.equal(t.reloads, 0);
});

test('a generic congestion message retries, and manual pause cancels it', () => {
  const t = tab({text:'アクセスが集中しています。再度お試しください。'});
  t.click(); t.tick(10000); assert.equal(t.reloads, 1);
  t.click(); t.tick(20000); assert.equal(t.reloads, 1); assert.equal(t.store.size, 0);
});

test('schedule uses Japan time and survives incidental reloads', () => {
  const t = tab(); t.schedule.value = '2026-10-27T21:00'; t.click(); t.tick(30000);
  assert.equal(t.reloads, 0);
  const next = tab({store:t.store, now:t.now}); next.tick(29999); assert.equal(next.reloads, 0);
  next.tick(1); assert.equal(next.reloads, 1);
});

test('30-minute limit, changed booking and broken storage never reload', () => {
  const t = tab(); t.click(); t.tick(30 * 60000); assert.equal(t.reloads, 0); assert.equal(t.store.size, 0);
  const a = tab(); a.click(); const b = tab({store:a.store, path:'/different-booking'});
  b.tick(10000); assert.equal(b.reloads, 0);
  const c = tab({storageFails:true}); c.click(); c.tick(10000); assert.equal(c.reloads, 0);
});

test('only the page path and timing are saved, not member tokens', () => {
  const t = tab(); t.click();
  const state = JSON.parse(t.store.get('cinema-retry-v1'));
  assert.deepEqual(Object.keys(state).sort(), ['page', 'startAt', 'until']);
});

test('the text download stays identical to the userscript', () => {
  assert.equal(source, fs.readFileSync(require('node:path').join(__dirname, '../cinema-retry.txt'), 'utf8'));
});
