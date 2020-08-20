let loadWordPromise: Promise<void> = null;
let words = null;

debugger;

const tritest = {
  D: {
    U: {
      N: {
        K: {
          _: true,
          E: {
            R: {
              _: true
            }
          }
        }
      }
    },
  },
};


const reduceLeaves = (node: object) => {
  // const reduceNodeToString = (node) => {

  const keys = Object.keys(node);
  keys.forEach(key => {
    if (key !== '_') {
      let wordKey = key;
      let childNode = node[key];
      while (true) {
        const childKeys = Object.keys(childNode);
        if (childKeys.length === 1) {
          if (childKeys[0] === '_') {
            // debugger;
            break;
          } else {
            wordKey += childKeys[0];
            childNode = childNode[childKeys[0]];
          }
        } else {
          reduceLeaves(childNode);
          break;
        }
      }
      if (wordKey.length > 1) {
        node[wordKey] = childNode;
        delete node[key];
      }
    }
  });
  return node;
};

// let result = '';
// while (true) {
//   const keys = Object.keys(node);
//   if (keys.length === 1) {
//     const key = keys[0];
//     if (key === '_') {
//       return (result.length > 1) ? result : null;
//     }
//     result += key;
//     node = node[key];
//   } else {

//   }
//   //   return null;
//   // else if (keys.length === 2) {
//   //   if (node['_']) {
//   //     result += keys.filter(key => (key !== '_'));
//   //     if (result.length > 1) {
//   //       debugger;
//   //       return result;
//   //     } else {
//   //       return null;
//   //     }
//   //   }
//   //   return null;
//   // } else {
//   //   return null;
//   // }
// }
//   };

// const keys = Object.keys(node);

// keys.forEach(key => {

//   if (key !== '_') {
//     const reduced = reduceNodeToString(node[key]);
//     if (reduced) {
//       debugger;
//       node[key] = reduced;
//     } else {
//       reduceLeaves(node[key]);
//     }
//   }
// });
// return node;
// }

// const testReduced = reduceLeaves(tritest);
// debugger;

function arrayToTrie(words: Array<string>) {
  const result = {};
  words.forEach(word => {
    word = word.toUpperCase();
    let node = result;
    // let testWord = word;
    // console.log(testWord);

    while (word.length) {
      const char = word.substr(0, 1);
      word = word.substr(1);
      if (!node[char]) {
        node = node[char] = {
        };
      } else {
        node = node[char];
      }
      if (!word.length) {
        node['_'] = true;
      }
    }
  });

  reduceLeaves(result);
  debugger;
  return result;
}
initDictionary();

export function initDictionary() {
  if (!loadWordPromise) {


    loadWordPromise = new Promise<void>((resolve, reject) => {
      fetch('/dictionary.json')
        .then(response => response.json())
        .then(data => {
          words = data;
          const t = arrayToTrie(words);

          resolve();
        });
    });
  }
  return loadWordPromise;
}

export const checkWord = (word: string) => {

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

  if (binarySearch(words, word.toLowerCase()) === -1) {
    return false;
  }
  return true;
}
