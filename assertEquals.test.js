const assertEquals = require('./assertEquals');

const complexObject1 = {
  propA: 1,
  propB: { propA: [1, { propA: 'a', propB: 'b' }, 3], propB: 1, propC: 2 }
};
const complexObject1Copy = {
  propA: 1,
  propB: { propA: [1, { propA: 'a', propB: 'b' }, 3], propB: 1, propC: 2 }
};
const complexObject2 = {
  propA: 1,
  propB: { propB: 1, propA: [1, { propA: 'a', propB: 'c' }, 3], propC: 2 }
};
const complexObject3 = {
  propA: 1,
  propB: { propA: [1, { propA: 'a', propB: 'b' }, 3], propB: 1 }
};

const passes = (expected, actual) => expect(() => assertEquals(expected, actual)).not.toThrow();
const fails = (expected, actual) => expect(() => assertEquals(expected, actual)).toThrow();
const failsWith = (expected, actual, message) =>
  expect(() => assertEquals(expected, actual)).toThrow(new Error(message));

// Groups are numbered in the order they were driven out with TDD (see tdd/).
describe('assertEquals', () => {
  describe('1. primitives', () => {
    it('passes for equal strings', () => passes('abc', 'abc'));
    it('fails for different strings', () =>
      failsWith('abcef', 'abc', 'Expected "abcef" but found "abc"'));
    it('is case sensitive', () => failsWith('a', 'A', 'Expected "a" but found "A"'));
    it('passes for equal empty strings', () => passes('', ''));
    it('passes for equal numbers', () => passes(1, 1));
    it('fails for different numbers', () => failsWith(1, 2, 'Expected 1 but found 2'));
    it('fails for opposite infinities', () =>
      failsWith(Infinity, -Infinity, 'Expected Infinity but found -Infinity'));
    it('passes for equal booleans', () => passes(true, true));
    it('fails for different booleans', () =>
      failsWith(true, false, 'Expected true but found false'));
    it('passes for undefined and undefined', () => passes(undefined, undefined));
    it('passes for null and null', () => passes(null, null));
    it('treats NaN as equal to NaN', () => passes(NaN, NaN));
  });

  describe('2. type mismatches', () => {
    it('does not coerce number to string', () =>
      failsWith(1, '1', 'Expected type number but found type string'));
    it('does not coerce boolean to string', () =>
      failsWith(true, 'true', 'Expected type boolean but found type string'));
    it('distinguishes 0 from an empty string', () =>
      failsWith(0, '', 'Expected type number but found type string'));
    it('distinguishes null from undefined', () =>
      failsWith(null, undefined, 'Expected type null but found type undefined'));
    it('fails when null is expected but an object is found', () =>
      failsWith(null, {}, 'Expected type null but found type Object'));
    it('fails when an object is expected but null is found', () =>
      failsWith({}, null, 'Expected type Object but found type null'));
    it('fails when a string is compared with an array', () =>
      failsWith('a', ['a'], 'Expected type string but found type Array'));
    it('fails when comparing different kinds of object', () =>
      failsWith(new Date(0), {}, 'Expected type Date but found type Object'));
  });

  describe('3. arrays', () => {
    it('passes for equal arrays', () => passes(['a', 'b', 'c'], ['a', 'b', 'c']));
    it('passes for empty arrays', () => passes([], []));
    it('passes for nested arrays', () => passes([[1], [2, [3]]], [[1], [2, [3]]]));
    it('fails when an array is compared with an object', () =>
      failsWith(['a'], { 0: 'a' }, 'Expected array but found object'));
    it('fails when an object is compared with an array', () =>
      failsWith({ 0: 'a' }, ['a'], 'Expected object but found array'));
    it('fails when actual is longer', () =>
      failsWith(['a', 'b'], ['a', 'b', 'c'], 'Expected array length 2 but found 3'));
    it('fails when actual is shorter', () =>
      failsWith(['a', 'b', 'c'], ['a', 'b'], 'Expected array length 3 but found 2'));
    it('fails when an element differs', () => fails(['a', 'b'], ['a', 'x']));
    it('is order sensitive', () => fails([1, 2], [2, 1]));
  });

  describe('4. objects', () => {
    it('passes for equal flat objects', () => passes({ a: 1, b: 2 }, { a: 1, b: 2 }));
    it('passes for empty objects', () => passes({}, {}));
    it('ignores key order', () => passes({ a: 1, b: 2 }, { b: 2, a: 1 }));
    it('passes for equal nested objects', () => passes({ a: { b: 1 } }, { a: { b: 1 } }));
    it('fails for a differing property', () =>
      failsWith({ a: 1 }, { a: 2 }, 'Expected a 1 but found 2'));
    it('fails for a missing property', () =>
      failsWith({ a: 1, b: 2 }, { a: 1 }, 'Expected b but was not found'));
    it('fails for an unexpected property', () =>
      failsWith({ a: 1 }, { a: 1, b: 2 }, 'Unexpected b found'));
    it('passes when both have an undefined-valued property', () =>
      passes({ a: undefined }, { a: undefined }));
    it('distinguishes a missing property from one set to undefined', () =>
      failsWith({ a: undefined }, {}, 'Expected a but was not found'));
    it('does not read inherited properties as present', () =>
      failsWith({ toString: 1 }, {}, 'Expected toString but was not found'));
  });

  describe('5. error paths in nested structures', () => {
    it('reports the index of a differing element', () =>
      failsWith(['a', 'b'], ['a', 'x'], 'Expected [1] "b" but found "x"'));
    it('reports the index when order differs', () =>
      failsWith([1, 2], [2, 1], 'Expected [0] 1 but found 2'));
    it('reports the path through nested arrays', () =>
      failsWith([[1], [2, [3]]], [[1], [2, [4]]], 'Expected [1][1][0] 3 but found 4'));
    it('reports a property inside an array element', () =>
      failsWith([{ a: 1 }], [{ a: 2 }], 'Expected [0].a 1 but found 2'));
    it('reports an element inside an array property', () =>
      failsWith({ a: [1, 2] }, { a: [1, 3] }, 'Expected a[1] 2 but found 3'));
    it('reports a nested type mismatch', () =>
      failsWith({ a: { b: [1] } }, { a: { b: { 0: 1 } } }, 'Expected a.b array but found object'));
    it('reports a nested length mismatch', () =>
      failsWith({ a: [1] }, { a: [1, 2] }, 'Expected a array length 1 but found 2'));
    it('reports a nested missing property', () =>
      failsWith({ a: { b: 1 } }, { a: {} }, 'Expected a.b but was not found'));
    it('reports a nested unexpected property', () =>
      failsWith({ a: {} }, { a: { b: 1 } }, 'Unexpected a.b found'));
    it('passes for a deep copy', () => passes(complexObject1, complexObject1Copy));
    it('passes for the same reference', () => passes(complexObject1, complexObject1));
    it('reports the full path for complexObject2', () =>
      failsWith(
        complexObject1,
        complexObject2,
        'Expected propB.propA[1].propB "b" but found "c"'
      ));
    it('reports the full path for complexObject3', () =>
      failsWith(complexObject1, complexObject3, 'Expected propB.propC but was not found'));
    it('reports the full path of an unexpected nested property', () =>
      failsWith(complexObject3, complexObject1, 'Unexpected propB.propC found'));
  });

  describe('6. dates', () => {
    it('passes for equal dates', () => passes(new Date(1000), new Date(1000)));
    it('fails for different dates', () =>
      failsWith(
        new Date(0),
        new Date(1000),
        'Expected 1970-01-01T00:00:00.000Z but found 1970-01-01T00:00:01.000Z'
      ));
    it('passes for two invalid dates', () => passes(new Date('x'), new Date('x')));
    it('fails for an invalid date vs a valid date', () =>
      failsWith(new Date('x'), new Date(0), 'Expected Invalid Date but found 1970-01-01T00:00:00.000Z'));
    it('compares dates nested in objects', () =>
      failsWith(
        { when: new Date(0) },
        { when: new Date(1000) },
        'Expected when 1970-01-01T00:00:00.000Z but found 1970-01-01T00:00:01.000Z'
      ));
  });

  describe('7. circular references', () => {
    const selfRef = (name) => {
      const o = { name };
      o.self = o;
      return o;
    };
    it('passes for equal self-referencing objects', () =>
      passes(selfRef('x'), selfRef('x')));
    it('still reports differences in self-referencing objects', () =>
      failsWith(selfRef('x'), selfRef('y'), 'Expected name "x" but found "y"'));
    it('handles cycles through arrays', () => {
      const a = [1];
      a.push(a);
      const b = [1];
      b.push(b);
      passes(a, b);
    });
    it('does not mistake a repeated (non-circular) reference for a cycle', () => {
      const shared = { x: 1 };
      passes({ a: shared, b: shared }, { a: { x: 1 }, b: { x: 1 } });
      failsWith({ a: shared, b: shared }, { a: { x: 1 }, b: { x: 2 } }, 'Expected b.x 1 but found 2');
    });
  });
});
