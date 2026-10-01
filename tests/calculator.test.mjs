import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateLove, getMessage, getMood, toTibetanNumerals } from '../docs/calculator.mjs';

test('matches known results from the original Python game', () => {
  assert.equal(calculateLove('Alice', 'Bob'), 66);
  assert.equal(calculateLove('Romeo', 'Juliet'), 78);
  assert.equal(calculateLove('Tenzin', 'Dolma'), 96);
});

test('normalizes whitespace, case, and equivalent Unicode', () => {
  assert.equal(calculateLove(' ALICE\t', 'b ob\n'), 66);
  assert.equal(calculateLove('é', 'Sam'), calculateLove('é', 'Sam'));
});

test('requires two nonempty names', () => {
  assert.throws(() => calculateLove('  ', 'Bob'));
  assert.throws(() => calculateLove('Alice', '\t'));
});

test('long repeated names and international names produce bounded scores', () => {
  const pairs = [['李明', '王芳'], ['💕', '💖'], ['Anne-Marie', 'O’Neil'], ['བསྟན་འཛིན', 'སྒྲོལ་མ']];
  for (let length = 1; length <= 60; length++) pairs.push(['a'.repeat(length), 'b'.repeat(61 - length)]);
  for (const pair of pairs) {
    const result = calculateLove(...pair);
    assert.ok(Number.isInteger(result) && result >= 0 && result <= 99);
    assert.equal(getMessage(result).length, 2);
  }
});

test('every score maps to a reaction', () => {
  assert.equal(getMood(99), 'ecstatic');
  assert.equal(getMood(85), 'ecstatic');
  assert.equal(getMood(70), 'happy');
  assert.equal(getMood(50), 'sweet');
  assert.equal(getMood(30), 'sad');
  assert.equal(getMood(3), 'heartbroken');
});

test('formats Tibetan numerals', () => {
  assert.equal(toTibetanNumerals(96), '༩༦');
  assert.equal(toTibetanNumerals(0), '༠');
});
