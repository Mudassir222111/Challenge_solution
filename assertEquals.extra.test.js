const assertEquals = require('./assertEquals');

describe('extra: types not covered by the brief', () => {
  test('rejects Map comparison (or compares contents)', () => {
    expect(() => assertEquals(new Map([['a',1]]), new Map([['b',2]]))).toThrow();
  });
  test('rejects Set comparison', () => {
    expect(() => assertEquals(new Set([1]), new Set([2]))).toThrow();
  });
  test('rejects typed arrays with different contents', () => {
    expect(() => assertEquals(new Uint8Array([1,2]), new Uint8Array([1,3]))).toThrow();
  });
  test('compares BigInt by value', () => {
    assertEquals(1n, 1n);
    expect(() => assertEquals(1n, 2n)).toThrow();
  });
  test('BigInt and Number are different types', () => {
    expect(() => assertEquals(1n, 1)).toThrow(/type/);
  });
  test('symbol keys with same description are not equal', () => {
    expect(() => assertEquals(Symbol('x'), Symbol('x'))).toThrow();
  });
  test('locks in -0 vs 0 behaviour', () => {
    // document your choice
    assertEquals(-0, 0);   // if you keep === semantics
  });
});

describe('extra: error message formats from the brief', () => {
  test('string mismatch quotes both sides', () => {
    expect(() => assertEquals('abcef', 'abc')).toThrow('Expected "abcef" but found "abc"');
  });
  test('array vs object mismatch', () => {
    expect(() => assertEquals(['a'], {0:'a'})).toThrow('Expected array but found object');
  });
  test('array length mismatch', () => {
    expect(() => assertEquals(['a','b'], ['a','b','c'])).toThrow('Expected array length 2 but found 3');
  });
  test('null vs object', () => {
    expect(() => assertEquals(null, {})).toThrow('Expected type null but found type Object');
  });
  test('nested missing property', () => {
    expect(() => assertEquals(
      { propB: { propC: 2 } },
      { propB: {} }
    )).toThrow('Expected propB.propC but was not found');
  });
});