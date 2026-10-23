function assertEquals(expected, actual) {
  if (isArrayObjectMismatch(expected, actual)) {
    fail(`Expected ${shapeOf(expected)} but found ${shapeOf(actual)}`);
  }
  if (typeLabel(expected) !== typeLabel(actual)) {
    fail(`Expected type ${typeLabel(expected)} but found type ${typeLabel(actual)}`);
  }
  if (Array.isArray(expected)) {
    return compareArrays(expected, actual);
  }
  const same = expected === actual || (Number.isNaN(expected) && Number.isNaN(actual));
  if (!same) {
    fail(`Expected ${format(expected)} but found ${format(actual)}`);
  }
}

function compareArrays(expected, actual) {
  if (expected.length !== actual.length) {
    fail(`Expected array length ${expected.length} but found ${actual.length}`);
  }
  expected.forEach((item, index) => assertEquals(item, actual[index]));
}

function fail(message) {
  throw new Error(message);
}

function isObjectLike(value) {
  return typeof value === 'object' && value !== null;
}

function isArrayObjectMismatch(expected, actual) {
  return isObjectLike(expected) && isObjectLike(actual) &&
    Array.isArray(expected) !== Array.isArray(actual);
}

function shapeOf(value) {
  return Array.isArray(value) ? 'array' : 'object';
}

function typeLabel(value) {
  if (value === null) return 'null';
  if (typeof value === 'object') return value.constructor ? value.constructor.name : 'Object';
  return typeof value;
}

function format(value) {
  return typeof value === 'string' ? JSON.stringify(value) : String(value);
}

module.exports = assertEquals;
