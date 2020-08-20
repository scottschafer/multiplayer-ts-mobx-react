import { toJS } from "mobx";

let verbose = false;

export function setObjectUtilsVerbose(val: boolean) {
  verbose = val;
}

function simplifyValue(val: any, preventCircular: Set<Object> = null, depth = 0): any {
  if (!val || typeof val === 'string' || typeof val === 'number') {
    return val;
  }
  if (typeof val === 'function') {
    return undefined;
  }
  if (typeof val === 'object') {
    if (Array.isArray(val)) {
      return val.map(elem => simplifyValue(elem, preventCircular, depth + 1));
    }
    return simplifyObject(val, preventCircular);
  }
}

function simplifyObject(obj: object, preventCircular: Set<Object> = null, depth = 0): object {
  if (!preventCircular) {
    preventCircular = new Set<Object>();
  }
  preventCircular.add(obj);
  const result = {};
  Object.keys(obj).forEach(key => {
    if (preventCircular.has(obj[key]) && depth > 100) {
      console.log(`circular key detected in ${key}`);
      debugger;
    }
    const val = simplifyValue(obj[key], preventCircular, depth + 1);
    if (val !== undefined) {
      result[key] = val;
    }
  });
  return result;
}

export function toMinifiedObject(obj: object): object {
  obj = toJS(obj);
  // try {
  //   console.log(JSON.stringify(obj));
  // } catch (e) {
  //   debugger;
  // }
  const result = simplifyObject(obj);
  return result;
}

export function assignObject(target: object, src: object, path: string = '/') {

  const srcKeys = Object.keys(src);
  if (path !== '/') {
    const dstKeys = Object.keys(target);
    const dstKeysSet = new Set<string>(dstKeys);
    dstKeysSet.forEach(dstKey => {
      if (!src.hasOwnProperty(dstKey)) {
        const targetVal = target[dstKey];
        delete target[dstKey];

        verbose && console.log(`assignObject: deleting ${path + dstKey}`);
      }
    });
  }
  srcKeys.forEach(key => {
    const srcVal = src[key];
    if (srcVal === undefined || srcVal === null) {
      verbose && console.log(`assignObject: deleting ${path + key}`);
      delete target[key];
      debugger;
    } else if (typeof srcVal === 'object') {
      if (Array.isArray(srcVal)) {
        verbose && console.log(`assignObject: assigning array ${path + key}`);
        target[key] = srcVal;
      } else {
        if (!target[key]) {
          target[key] = {};
        }
        assignObject(target[key], srcVal, path + key + '/');
      }
    } else {
      verbose && console.log(`assignObject: assigning ${path + key} the value of ${srcVal}`);
      target[key] = srcVal;
    }
  });
}

export function calculateUpdates2(oldVal: object, newVal: object): object {

  const getShallowUpdates = (oldVal: object, newVal: object, path = '') => {
    let result = {};

    const oldValKeys = Object.keys(oldVal);
    const newValKeys = Object.keys(newVal);

    const newValKeysSet = new Set<string>(newValKeys);

    // if the old value has keys that aren't present in the new value, add a deletion event
    oldValKeys.forEach(oldKey => {
      if (!newValKeysSet.has(oldKey)) {
        result[oldKey] = null;
      }
    });

    newValKeys.forEach(newKey => {
      const fieldPath = path + newKey;
      const newFieldVal = newVal[newKey];
      if (typeof newFieldVal === 'object') {
        if (Array.isArray(newFieldVal)) {
          // for now, anyway, don't bother comparing arrays
          result[fieldPath] = newFieldVal;
        } else {
          result[fieldPath] = getShallowUpdates(oldVal[newKey], newFieldVal, fieldPath + '/');
        }
      } else {
        result[fieldPath] = newFieldVal;
      }
    });
    return result;
  }

  return getShallowUpdates(oldVal, newVal);
}

export function getCollapsedObjectFields(obj: object) {
  debugger;
  const result = {};
  Object.keys(obj).forEach(key => {
    let fieldVal = obj[key];
    if (fieldVal === null) {
      result[key] = null;
    } else if (typeof fieldVal === 'object' && !Array.isArray(fieldVal)) {
      let condensedPath = key;
      let childNode = fieldVal;
      let childNodeKeys = Object.keys(childNode);

      while (childNodeKeys.length === 1) {
        condensedPath += '/' + childNodeKeys[0];
        childNode = childNode[childNodeKeys[0]];
        if (typeof childNode !== 'object' || Array.isArray(childNode)) {
          break;
        }
        childNodeKeys = Object.keys(childNode);
      }
      if (typeof childNode === 'object' || !Array.isArray(childNode)) {
        childNode = getCollapsedObjectFields(childNode);
      }
      result[condensedPath] = childNode;
    }
  });
  return result;
}

export function collapseObjectFields(result: object) {
  debugger;
  Object.keys(result).forEach(key => {

    let fieldVal = result[key];

    let combinedPath = key;
    let childNode = fieldVal;
    while ((typeof (fieldVal) === 'object' && !Array.isArray(fieldVal))) {
      const childKeys = Object.keys(fieldVal)
      if (Object.keys(fieldVal).length === 1) {

      }
    }

    if (typeof (fieldVal) === 'object' && !Array.isArray(fieldVal)) {
      let path = key;
      let keys = Object.keys(fieldVal);
      while (keys.length === 1) {
        const nextValue = fieldVal[keys[0]];
        path += '/' + keys[0];
        fieldVal = nextValue;
        if (typeof (nextValue) !== 'object' || Array.isArray(nextValue)) {
          break;
        }
        keys = Object.keys(fieldVal);
      }
      if (path !== key) {
        delete result[key];
        result[path] = fieldVal;
      }
    }
  });
  return result;
}

export function calculateUpdates3(oldVal: object, newVal: object): object {

  const getObjectDifferences = (oldVal: object, newVal: object) => {
    let result: object = null;

    const put = (field: string, val: any) => {
      if (!result) {
        result = {};
      }
      result[field] = val;
    }

    const oldValKeys = Object.keys(oldVal);
    const newValKeys = Object.keys(newVal);

    const newValKeysSet = new Set<string>(newValKeys);

    // if the old value has keys that aren't present in the new value, add a deletion event
    oldValKeys.forEach(oldKey => {
      if (!newValKeysSet.has(oldKey)) {
        put(oldKey, null);
      }
    });

    newValKeys.forEach(newKey => {
      const oldFieldVal = oldVal[newKey];
      const newFieldVal = newVal[newKey];
      if (!oldFieldVal && newFieldVal) {
        put(newKey, newFieldVal)
      }
      if (typeof newFieldVal === 'object' && !Array.isArray(newFieldVal) && oldFieldVal) {
        const changes = getObjectDifferences(oldFieldVal, newFieldVal);
        if (changes) {
          put(newKey, changes);
        }
      } else if (oldFieldVal !== newFieldVal) {
        put(newKey, newFieldVal);
      }
    });
    return result;
  }

  const result = getObjectDifferences(oldVal, newVal);
  return collapseObjectFields(result);


  // const getShallowUpdates = (oldVal: object, newVal: object) => {
  //   let result = {};

  //   const oldValKeys = Object.keys(oldVal);
  //   const newValKeys = Object.keys(newVal);

  //   const newValKeysSet = new Set<string>(newValKeys);

  //   // if the old value has keys that aren't present in the new value, add a deletion event
  //   oldValKeys.forEach(oldKey => {
  //     if (!newValKeysSet.has(oldKey)) {
  //       result[oldKey] = null;
  //     }
  //   });

  //   newValKeys.forEach(newKey => {
  //     const oldFieldVal = oldVal[newKey];
  //     const newFieldVal = newVal[newKey];
  //     if (typeof newFieldVal === 'object') {
  //       if (Array.isArray(newFieldVal)) {
  //         // for now, anyway, don't bother comparing arrays
  //         result[newKey] = newFieldVal;
  //       } else {
  //         result[newKey] = getShallowUpdates(oldFieldVal, newFieldVal);
  //       }

  //       // now collapse any fields that are objects containing single objects


  //     } else if (oldFieldVal !== newFieldVal) {
  //       result[newKey] = newFieldVal;
  //     }
  //   });
  //   return result;
  // }

  // const result = getShallowUpdates(oldVal, newVal);

  // return result;
}


export function calculateUpdates(oldVal: object, newVal: object, target: object = null, path: string = '/'): object {
  if (newVal === null) {
    debugger;
    console.error(`Error in model: ${path} cannot be null`);
    return;
  }

  const result = target || {};

  const newValKeys = Object.keys(newVal);

  const newValKeysSet = new Set<string>(newValKeys);

  // console.log(path);
  // if (path.includes('6aZDortETkRpWOoL2X38A2Y0XJ13')) {
  //   debugger;
  // }
  if (path.length > 1 && result[path.substr(path.length - 1)] === null) {
    debugger;
    delete result[path.substr(path.length - 1)];
  }
  // if the old value has keys that aren't present in the new value, add a deletion event
  if (oldVal) {
    const oldValKeys = Object.keys(oldVal);
    oldValKeys.forEach(oldKey => {
      if (!newValKeysSet.has(oldKey)) {
        const deletePath = path + oldKey;
        result[deletePath] = null;
        Object.keys(result).forEach(key => {
          if (deletePath !== key && key.startsWith(deletePath)) {
            console.log(`removing updates to deleted "${deletePath}\\${key}"`);
            delete result[key];
          }
        })
      }
    });
  }

  newValKeys.forEach(newKey => {
    const oldFieldVal = oldVal ? oldVal[newKey] : null;
    const fieldPath = path + newKey;
    // if (fieldPath.includes('6aZDortETkRpWOoL2X38A2Y0XJ13')) {
    //   debugger;
    // }
    let newFieldVal = newVal[newKey];
    if (newFieldVal === null || newFieldVal === undefined) {
      console.log(`${fieldPath} is null, skipping`);
      return;
    }
    if (typeof newFieldVal === 'object') {
      if (Array.isArray(newFieldVal)) {
        if (JSON.stringify(newFieldVal) !== JSON.stringify(oldFieldVal)) {
          result[fieldPath] = newFieldVal;
        }
      } else {
        if (result[fieldPath] === null) {
          delete result[fieldPath];
        }
        calculateUpdates(oldFieldVal, newFieldVal, result, fieldPath + '/');
        // if (Object.keys(newFieldVal).length === 1) {
        //   calculateUpdates(oldVal[newKey], newVal[newKey], result, fieldPath);
        // } else {

        // }
      }
    } else {
      if (newFieldVal !== oldFieldVal) {
        result[fieldPath] = newFieldVal;
      }
    }
  });

  return result;
}

(
  function () {

    // debugger;
    // console.log(JSON.stringify(getCollapsedObjectFields({ a: { b: { c: 2, f: { g: 3 } } }, d: { e: 4 } })));

    // const result = calculateUpdates
    //   (
    //     { a: { b: { c: 1 } }, d: { e: 4, g: 9, h: 1, i: 0 } },
    //     { a: { b: { c: 2, f: { g: 3 } } }, d: { e: 4, h: 3 } }
    //   );
    // console.log(JSON.stringify(result));
    // debugger;

  })();

