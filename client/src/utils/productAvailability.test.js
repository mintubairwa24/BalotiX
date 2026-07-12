import test from 'node:test';
import assert from 'node:assert/strict';
import { getProductStockState } from './productAvailability.js';

test('returns in-stock state when product has an explicit stock flag', () => {
  const state = getProductStockState({ isInStock: true, isLowStock: false, stockQuantity: 5 });

  assert.equal(state.isInStock, true);
  assert.equal(state.isLowStock, false);
  assert.equal(state.stockQuantity, 5);
});

test('falls back to stockQuantity when the backend has not hydrated stock flags', () => {
  const state = getProductStockState({ stockQuantity: 3, lowStockThreshold: 5 });

  assert.equal(state.isInStock, true);
  assert.equal(state.isLowStock, true);
  assert.equal(state.stockQuantity, 3);
});

test('defaults to available when stock data is missing', () => {
  const state = getProductStockState({});

  assert.equal(state.isInStock, true);
  assert.equal(state.isLowStock, false);
  assert.equal(state.stockQuantity, null);
});
