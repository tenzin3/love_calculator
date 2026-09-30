// The original pen-and-paper game: count letters, then add from the outside in.
export function calculateLove(firstName, secondName) {
  const normalize = name => name.normalize('NFC').trim().replace(/\s/gu, '').toLowerCase();
  const first = normalize(firstName);
  const second = normalize(secondName);
  if (!first || !second) throw new Error('Both names are needed to find your spark.');
  const counts = new Map();
  for (const character of first + 'love' + second) {
    counts.set(character, (counts.get(character) || 0) + 1);
  }
  // Split every count into digits so long, repeated names cannot exceed 99%.
  let digits = [...counts.values()].flatMap(count => Array.from(String(count), Number));
  while (digits.length > 2) {
    const next = [];
    for (let left = 0, right = digits.length - 1; left <= right; left++, right--) {
      const sum = left === right ? digits[left] : digits[left] + digits[right];
      next.push(...Array.from(String(sum), Number));
    }
    digits = next;
  }
  if (digits.length === 1) return digits[0];
  if (digits[1] === 0) return digits[0] * 10;
  return digits[0] + digits[1] < 10 ? digits[0] + digits[1] : digits[0] * 10 + digits[1];
}

export function getMessage(score) {
  if (score >= 80) return ['Oh, the butterflies.', 'Some names just look good together. Yours might be two of them. Go make a little magic.'];
  if (score >= 50) return ['There’s a little spark.', 'A little curiosity can be the start of something lovely. Maybe this is your sign to say hello.'];
  return ['Love loves a plot twist.', 'The best stories don’t always follow the numbers. A little courage can write a whole new ending.'];
}
