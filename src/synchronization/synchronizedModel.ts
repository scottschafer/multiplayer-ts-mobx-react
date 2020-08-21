import { MakeWritable } from "../utils/changeProperties";
import { firebaseApp } from '../firebase/firebaseApp';
import { assignObject } from '../utils/objectUtils';

export class SynchronizedModel {
  readonly key: string;

  static dbPath: string = '';

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
        const asWriteable = this as MakeWritable<SynchronizedModel>;
        asWriteable.key = result.key;
      });
      return pushResult;
    }
  }


  private toObject() {
    const vo = JSON.parse(JSON.stringify(this));
    return vo;
  }
}