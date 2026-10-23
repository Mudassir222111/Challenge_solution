function assertEquals(expected, actual) {
  compare(expected, actual, '', new Map());
}

function compare(expected, actual, path, inProgress) {
  const where = path ? `${path} ` : '';

  if (isArrayObjectMismatch(expected, actual)) {
    fail(`Expected ${where}${shapeOf(expected)} but found ${shapeOf(actual)}`);
  }
  if (typeLabel(expected) !== typeLabel(actual)) {
    fail(`Expected ${where}type ${typeLabel(expected)} but found type ${typeLabel(actual)}`);
  }
  if (expected instanceof Date) {
    compareDates(expected, actual, where);
  } else if (isObjectLike(expected)) {
    compareContainers(expected, actual, path, inProgress);
  } else {
    comparePrimitives(expected, actual, where);
  }
}

// Arrays and objects can contain cycles. A pair that is already being compared
// further up the current path is assumed equal; the pair is released afterwards
// so that merely repeated (non-circular) references are still fully compared.
function compareContainers(expected, actual, path, inProgress) {
  if (isInProgress(inProgress, expected, actual)) return;
  markInProgress(inProgress, expected, actual);
  try {
    if (Array.isArray(expected)) {
      compareArrays(expected, actual, path, inProgress);
    } else {
      compareObjects(expected, actual, path, inProgress);
    }
  } finally {
    unmarkInProgress(inProgress, expected, actual);
  }
}

function isInProgress(inProgress, expected, actual) {
  return inProgress.has(expected) && inProgress.get(expected).has(actual);
}

function markInProgress(inProgress, expected, actual) {
  if (!inProgress.has(expected)) inProgress.set(expected, new Set());
  inProgress.get(expected).add(actual);
}

function unmarkInProgress(inProgress, expected, actual) {
  inProgress.get(expected).delete(actual);
}

function compareArrays(expected, actual, path, inProgress) {
  if (expected.length !== actual.length) {
    const where = path ? `${path} ` : '';
    fail(`Expected ${where}array length ${expected.length} but found ${actual.length}`);
  }
  expected.forEach((item, index) => compare(item, actual[index], `${path}[${index}]`, inProgress));
}

function compareObjects(expected, actual, path, inProgress) {
  Object.keys(expected).forEach((key) => {
    const propPath = joinPath(path, key);
    if (!hasOwn(actual, key)) {
      fail(`Expected ${propPath} but was not found`);
    }
    compare(expected[key], actual[key], propPath, inProgress);
  });
  Object.keys(actual).forEach((key) => {
    if (!hasOwn(expected, key)) {
      fail(`Unexpected ${joinPath(path, key)} found`);
    }
  });
}

function compareDates(expected, actual, where) {
  if (!Object.is(expected.getTime(), actual.getTime())) {
    fail(`Expected ${where}${formatDate(expected)} but found ${formatDate(actual)}`);
  }
}

function formatDate(date) {
  return Number.isNaN(date.getTime()) ? 'Invalid Date' : date.toISOString();
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

function joinPath(path, key) {
  return path ? `${path}.${key}` : key;
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
