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
// Add regression coverage for the reported incident.
