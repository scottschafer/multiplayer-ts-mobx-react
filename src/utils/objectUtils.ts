import { toJS } from "mobx";
import { getConfig } from "../config/GameConfig";

let verbose = getConfig().development.verbose;
let breakOnErrors = getConfig().development.breakOnErrors;

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

  const result = simplifyObject(obj);
  return result;
}

export function assignObject(target: object, src: object, path: string = '/') {

  // check if the src is missing keys that are in the target and handle appropriately
  const srcKeys = Object.keys(src);
  const dstKeys = Object.keys(target);
  const dstKeysSet = new Set<string>(dstKeys);

  dstKeysSet.forEach(dstKey => {
    if (!src.hasOwnProperty(dstKey)) {
      const targetFieldVal = target[dstKey];
      if (typeof targetFieldVal === 'object') {
        verbose && console.log(`assignObject: deleting ${path + dstKey}`);
        // the removed field is an object or array
        if (Array.isArray(targetFieldVal)) {
          // if array, just set to empty
          verbose && console.log(`assignObject: clearing array instead of deleting ${path + dstKey}`);
          if (targetFieldVal.length) {
            targetFieldVal.length = 0;
          }
        } else {
          // // if an object, then remove the key ONLY if it's not at the top level of the model. If it's at the top level,
          // // then it's a field of the model itself (e.g 'usersInRoom') and shouldn't be deleted. But we should delete children
          // (e.g. usersInRoom/xyz if not present)
          if (path !== '/') {
            delete target[dstKey];
          } else {
            target[dstKey] = {};
          }
        }
      }

    }
  });

  srcKeys.forEach(key => {
    const srcVal = src[key];
    if (srcVal === undefined || srcVal === null) {
      verbose && console.log(`assignObject: ${path + key} is null or undefined. This is probably a bug`);
      if (breakOnErrors) {
        debugger;
      }
      //delete target[key];
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


export function calculateUpdates(oldVal: object, newVal: object, target: object = null, path: string = '/'): object {
  if (newVal === null) {
    if (breakOnErrors) {
      debugger;
    }
    console.error(`Error in model: ${path} cannot be null`);
    return;
  }

  const result = target || {};

  const newValKeys = Object.keys(newVal);

  const newValKeysSet = new Set<string>(newValKeys);

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
      }
    } else {
      if (newFieldVal !== oldFieldVal) {
        result[fieldPath] = newFieldVal;
      }
    }
  });

  return result;
}
