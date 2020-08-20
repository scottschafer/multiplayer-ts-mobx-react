import { firebaseApp } from "../firebase/firebaseApp";

export function getFromDatabase<T>(ref: string, callback: ((T) => void)) {
  const database = firebaseApp.database();
  database.ref(ref).once('value', (snapshot) => {
    callback(snapshot.val() || {});
  },
    () => {
      callback(null);
    });
}

export function getCollectionFromDatabase<T>(ref: string): Promise<{ [key: string]: T }> {
  const database = firebaseApp.database();

  return new Promise<{ [key: string]: T }>((resolve, reject) => {
    database.ref(ref).once('value', (snapshot) => {
      const val = snapshot.val();
      resolve(val || {}); //Object.values(val));
    },
      (error) => {
        reject(error);
      });
  });
}