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

// How the two characters react to a score.
export function getMood(score) {
  if (score >= 85) return 'ecstatic';
  if (score >= 65) return 'happy';
  if (score >= 45) return 'sweet';
  if (score >= 25) return 'sad';
  return 'heartbroken';
}

export function getMessage(score) {
  switch (getMood(score)) {
    case 'ecstatic': return ['Lha gyalo! A perfect knot.', 'Like the endless knot, your names loop right back to each other. Go tell someone.'];
    case 'happy': return ['Yakpo red — that’s lovely.', 'Warm as butter tea on a cold morning. There’s something real here worth a smile.'];
    case 'sweet': return ['A little spark on the wind.', 'Like a prayer flag in the breeze, it could go anywhere. Maybe this is your sign to say hello.'];
    case 'sad': return ['A-kha-kha… a cloudy pass.', 'The mountain road twists before it opens up. The numbers don’t know your story.'];
    default: return ['Heartbroken… for now.', 'Even the highest passes get snowed in. Love loves a plot twist — courage writes the ending.'];
  }
}

const TIBETAN_DIGITS = '༠༡༢༣༤༥༦༧༨༩';
export function toTibetanNumerals(value) {
  return String(value).replace(/\d/g, digit => TIBETAN_DIGITS[digit]);
}
