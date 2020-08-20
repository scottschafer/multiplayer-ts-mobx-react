import { MakeWritable } from "../utils/changeProperties";
import { firebaseApp } from '../firebase/firebaseApp';
import { toMinifiedObject, assignObject } from '../utils/objectUtils';

export class WatchableModel {
  readonly key: string;
  // readonly version: number = 0;
  // readonly lastUpdater: string = '';
  // readonly lastSetVersion: object;

  static dbPath: string = 'xxx';

  constructor(public readonly dbPath: string) {
  }

  get ref() {
    if (this.key) {
      return `${this.dbPath}/${this.key}`;
    }
    return null;
  }

  assign(data: object) {
    assignObject(this, data);
  }

  put(updates?: object) {
    const database = firebaseApp.database();
    const obj = this.toObject();

    if (this.ref) {
      // debugger;
      // let update = {
      //   '/a/c': [1, 2, 3],
      //   '/a/b': 3,
      //   '/a/d': { 'X': 0, 'Y': 0, 'Z': 1 }
      // };
      // database.ref(this.ref).update(update);
      // TODO - use update
      if (updates) {
        return database.ref(this.ref).update(updates);
      } else {
        return database.ref(this.ref).set(obj);
      }
    } else {
      const pushResult = database.ref(this.dbPath).push(obj);
      pushResult.then(result => {
        const asWriteable = this as MakeWritable<WatchableModel>;
        asWriteable.key = result.key;
      });
      return pushResult;
    }
  }

  // shouldUpdate(data: any) {
  //   if (this.version === data.version && this.lastUpdater === data.lastUpdater) {
  //     return false;
  //   }
  //   return true;
  // }

  getUpdates(compareWith: object) {

  }

  private toObject() {
    const self = this as MakeWritable<WatchableModel>;
    // ++self.version;
    // self.lastUpdater = firebaseApp.auth().currentUser?.uid || '';
    const vo = JSON.parse(JSON.stringify(this));
    return vo;
  }

  // private get asWriteable() {
  //   return 
  // }
}