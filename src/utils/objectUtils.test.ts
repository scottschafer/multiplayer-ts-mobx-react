import React from 'react';
import { assignObject, calculateUpdates } from './objectUtils';

test('assignObject', () => {
  const srcObject = {
    a: 1,
    b: 'string',
    c: [1, 2, 3]
  };
  const dstObject = {};
  assignObject(dstObject, srcObject);
  expect(JSON.stringify(srcObject)).toEqual(JSON.stringify(dstObject));
});

test('calculateUpdates', () => {
  expect(calculateUpdates
    (
      { a: 1, b: 3, c: 4 },
      { a: 1, b: 2 }
    )
  ).toMatchObject(
    { b: 2, c: null }
  );

  expect(calculateUpdates
    (
      { a: 1, b: 2, c: 4 },
      { a: 1, b: 2 }
    )
  ).toMatchObject(
    { c: null }
  );

  expect(calculateUpdates
    (
      { a: { b: { c: 1 } }, d: { e: 4 } },
      { a: { b: { c: 2 } }, d: { e: 4 } }
    )
  ).toMatchObject(
    { 'a/b/c': 2 }
  );

})