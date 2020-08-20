const legalCodeCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function getUniqueCode(existingCodes: Set<String>, minLength = 3, maxLength = 20) {

  const codeCharacters = legalCodeCharacters.split('').sort(() => (Math.random() - 0.5)).join('');

  // start with three letters then increase if necessary
  for (let len = minLength; len < maxLength; len++) {
    const uniqueCombos = Math.pow(codeCharacters.length, len);
    for (let combo = 0; combo < uniqueCombos; combo++) {
      let testCode = '';
      for (let i = 0; i < len; i++) {
        let n = (combo + i) % codeCharacters.length;
        combo /= codeCharacters.length;
        testCode += codeCharacters[n];
      }
      if (!existingCodes.has(testCode)) {
        return testCode;
      }
    }
  }
  return null;
}
