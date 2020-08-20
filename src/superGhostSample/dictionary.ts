let loadWordPromise: Promise<Dictionary> = null;

class Dictionary {
  constructor(private words: Array<string>) { }

  checkWord(word: string) {

    const binarySearch = (items: Array<string>, value: string) => {
      let firstIndex = 0,
        lastIndex = items.length - 1,
        middleIndex = Math.floor((lastIndex + firstIndex) / 2);

      while (items[middleIndex] !== value && firstIndex < lastIndex) {
        if (value < items[middleIndex]) {
          lastIndex = middleIndex - 1;
        }
        else if (value > items[middleIndex]) {
          firstIndex = middleIndex + 1;
        }
        middleIndex = Math.floor((lastIndex + firstIndex) / 2);
      }

      return (items[middleIndex] !== value) ? -1 : middleIndex;
    }

    if (binarySearch(this.words, word.toLowerCase()) === -1) {
      return false;
    }
    return true;
  }
};

export function initDictionary() {
  if (!loadWordPromise) {
    loadWordPromise = new Promise<Dictionary>((resolve, reject) => {
      fetch('/dictionary.json')
        .then(response => response.json())
        .then(data => {
          const dictionary = new Dictionary(data);
          resolve(dictionary);
        });
    });
  }
  return loadWordPromise;
}
