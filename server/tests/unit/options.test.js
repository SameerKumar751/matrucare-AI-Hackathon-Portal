const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

test('client and server option lists (incl. colleges) are identical', () => {
  const server = fs.readFileSync(path.join(__dirname, '../../config/options.json'), 'utf8');
  const client = fs.readFileSync(path.join(__dirname, '../../../client/src/config/options.json'), 'utf8');
  assert.deepEqual(JSON.parse(client), JSON.parse(server));
});
test('colleges list is non-empty and has an editable fallback entry', () => {
  const { colleges } = require('../../utils/options');
  assert.ok(colleges.length > 1 && colleges.some((c) => /Other/.test(c)));
});
