import test from 'node:test';
import assert from 'node:assert/strict';
import { seed } from '../src/store.js';
import { sendMessage, processWebhook } from '../src/messages.js';
function memoryStore() { let data = seed(); return { read: () => structuredClone(data), write: value => { data = structuredClone(value); } }; }
test('sending persists the selected prospect and text', () => {
  const store = memoryStore();
  const message = sendMessage(store, 'p-102', 'Hello');
  assert.equal(message.prospectId, 'p-102');
  assert.equal(store.read().messages[0].body, 'Hello');
});
test('blank message is rejected', () => { assert.throws(() => sendMessage(memoryStore(), 'p-102', ' ')); });
test('unknown webhook message is rejected', () => { assert.throws(() => processWebhook(memoryStore(), { type: 'message.sent', messageId: 'missing' })); });
const listFor = (store, prospectId) => store.read().messages.filter(m => m.prospectId === prospectId);
const sentEvent = message => ({ type: 'message.sent', messageId: message.id, externalNumber: message.to, status: 'sent', body: message.body });
test('sent webhook keeps the message on its prospect when prospects share a phone number', () => {
  const store = memoryStore();
  const message = sendMessage(store, 'p-102', 'Hello Jordan');
  processWebhook(store, sentEvent(message));
  assert.deepEqual(listFor(store, 'p-102').map(m => m.id), [message.id]);
  assert.equal(listFor(store, 'p-101').length, 0);
});
test('duplicate sent webhook does not duplicate the message', () => {
  const store = memoryStore();
  const message = sendMessage(store, 'p-102', 'Hello');
  processWebhook(store, sentEvent(message));
  processWebhook(store, sentEvent(message));
  assert.equal(store.read().messages.length, 1);
  assert.equal(listFor(store, 'p-102').length, 1);
});
test('status-only webhook updates status and preserves the body', () => {
  const store = memoryStore();
  const message = sendMessage(store, 'p-102', 'Hello');
  processWebhook(store, sentEvent(message));
  processWebhook(store, { type: 'message.status_updated', messageId: message.id, externalNumber: message.to, status: 'delivered' });
  const [stored] = listFor(store, 'p-102');
  assert.equal(stored.status, 'delivered');
  assert.equal(stored.body, 'Hello');
});
test('webhook with a mismatched number is rejected without changing the message', () => {
  const store = memoryStore();
  const message = sendMessage(store, 'p-102', 'Hello');
  assert.throws(() => processWebhook(store, { ...sentEvent(message), externalNumber: '+19995550000', status: 'delivered' }));
  assert.equal(store.read().messages[0].status, 'sent');
});
