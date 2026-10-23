function assertEquals(expected, actual) {
  compare(expected, actual, '');
}

function compare(expected, actual, path) {
  const where = path ? `${path} ` : '';

  if (isArrayObjectMismatch(expected, actual)) {
    fail(`Expected ${where}${shapeOf(expected)} but found ${shapeOf(actual)}`);
  }
  if (typeLabel(expected) !== typeLabel(actual)) {
    fail(`Expected ${where}type ${typeLabel(expected)} but found type ${typeLabel(actual)}`);
  }
  if (Array.isArray(expected)) {
    compareArrays(expected, actual, path);
  } else if (isObjectLike(expected)) {
    compareObjects(expected, actual);
  } else {
    comparePrimitives(expected, actual, where);
  }
}

function compareArrays(expected, actual, path) {
  if (expected.length !== actual.length) {
    const where = path ? `${path} ` : '';
    fail(`Expected ${where}array length ${expected.length} but found ${actual.length}`);
  }
  expected.forEach((item, index) => compare(item, actual[index], ''));
}

function compareObjects(expected, actual) {
  Object.keys(expected).forEach((key) => {
    if (!hasOwn(actual, key)) {
      fail(`Expected ${key} but was not found`);
    }
    compare(expected[key], actual[key], key);
  });
  Object.keys(actual).forEach((key) => {
    if (!hasOwn(expected, key)) {
      fail(`Unexpected ${key} found`);
    }
  });
}

function comparePrimitives(expected, actual, where) {
  const same = expected === actual || (Number.isNaN(expected) && Number.isNaN(actual));
  if (!same) {
    fail(`Expected ${where}${format(expected)} but found ${format(actual)}`);
  }
}

function fail(message) {
  throw new Error(message);
}

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
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
