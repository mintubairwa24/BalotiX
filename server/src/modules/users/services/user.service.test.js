import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeProfilePayload } from './user.service.js';

test('normalizes a combined name field into first and last name fields', () => {
  const payload = normalizeProfilePayload({
    name: 'Jane Doe',
    phoneNumber: '+919999999999',
  });

  assert.equal(payload.firstName, 'Jane');
  assert.equal(payload.lastName, 'Doe');
  assert.equal(payload.phoneNumber, '+919999999999');
});
