import test from 'node:test';
import assert from 'node:assert/strict';

import User from '../models/user.model.js';
import UserProfile from '../models/userProfile.model.js';
import { createUserAddress, getUserAddresses } from './user.service.js';

const originalFindOneAndUpdate = UserProfile.findOneAndUpdate;
const originalFindOne = UserProfile.findOne;
const originalUserFindById = User.findById;

test('createUserAddress stores a new address under the authenticated user profile', async () => {
  User.findById = () => ({
    select: () => ({})
  });

  UserProfile.findOneAndUpdate = () => ({
    lean: async () => ({
      addresses: [
        {
          label: 'Home',
          fullName: 'Jane Doe',
          phoneNumber: '+919999999999',
          addressLine1: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          postalCode: '400001',
          isDefault: false,
        },
      ],
    }),
  });

  const address = await createUserAddress('507f1f77bcf86cd799439011', {
    label: 'Home',
    fullName: 'Jane Doe',
    phoneNumber: '+919999999999',
    addressLine1: '123 Main Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    postalCode: '400001',
    isDefault: false,
  });

  assert.equal(address.label, 'Home');
  assert.equal(address.fullName, 'Jane Doe');
});

test('getUserAddresses returns the profile-backed address list', async () => {
  UserProfile.findOne = () => ({
    lean: async () => ({
      addresses: [{ _id: 'address-1', label: 'Home' }],
    }),
  });

  const addresses = await getUserAddresses('507f1f77bcf86cd799439011');
  assert.equal(addresses.length, 1);
  assert.equal(addresses[0].label, 'Home');
});

test.after(() => {
  User.findById = originalUserFindById;
  UserProfile.findOneAndUpdate = originalFindOneAndUpdate;
  UserProfile.findOne = originalFindOne;
});
