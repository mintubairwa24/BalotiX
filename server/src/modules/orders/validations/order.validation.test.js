import test from 'node:test';
import assert from 'node:assert/strict';

import { createOrderSchema } from './order.validation.js';

test('createOrderSchema accepts shippingAddressId for checkout order creation', () => {
  const result = createOrderSchema.safeParse({
    shippingAddressId: '507f1f77bcf86cd799439011',
  });

  assert.equal(result.success, true);
  assert.equal(result.data.shippingAddressId, '507f1f77bcf86cd799439011');
});
