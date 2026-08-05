import test from 'node:test';
import assert from 'node:assert/strict';

import Cart from '../models/cart.model.js';
import { removeItem } from './cart.service.js';

const originalFindOne = Cart.findOne;

const makeCartDoc = () => ({
  status: 'active',
  items: [
    {
      _id: 'cartItem-1',
      productId: 'product-1',
      quantity: 1,
      nameSnapshot: 'Test Product',
      priceSnapshot: 100,
    },
  ],
  save: async function () {
    return this;
  },
  populate: async function () {
    return this;
  },
  toJSON: function () {
    return this;
  },
});

test('removeItem removes a cart line by productId (regression)', async () => {
  Cart.findOne = async () => makeCartDoc();

  const result = await removeItem('user-1', 'product-1');

  assert.equal(result.items.length, 0);
  assert.equal(result.items[0], undefined);
});

test.after(() => {
  Cart.findOne = originalFindOne;
});
