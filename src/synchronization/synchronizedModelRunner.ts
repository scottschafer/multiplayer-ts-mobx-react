import { firebaseApp } from '../firebase/firebaseApp';
import { SynchronizedModel } from './synchronizedModel';
import { observable, reaction, toJS } from 'mobx';
import { MakeWritable } from '../utils/changeProperties';
import { calculateUpdates } from '../utils/objectUtils';
import { getConfig } from '../GameConfig';

function isVerbose() {
  return getConfig().development.verbose;
}

export enum LoadingState {
  NotLoaded,
  Loading,
  Loaded,
  NotFound
};

export type FirebaseCanceller = ((a: firebase.database.DataSnapshot | null, b?: string) => any) | undefined;
export class SynchronizedModelRunner<T extends SynchronizedModel> {

  @observable readonly model: T;
  @observable readonly loadingState: LoadingState = LoadingState.NotLoaded;
  @observable readonly updates = {};

  private _key: string = undefined;
  private suspendReaction = false;
  private previousModel: object = null;
  private cancelFirebaseWatch: FirebaseCanceller = null;
  private cancelModelChangeReaction: () => void = null;
  private cancellerModelUpdatesReaction: () => void = null;

  constructor(
    private TCreator: { new(): T; },
    private dbPath: string,
    private onLoaded?: () => void,
    key?: string
  ) {
    if (key) {
      this.key = key;
    }
  }

  get key() {
    return this._key;
  }

  set key(key: string) {
    if (this._key === key) {
      return;
    }
    this._key = key;

    if (this.cancelFirebaseWatch) {
      this.cancelFirebaseWatch(null);
      this.cancelFirebaseWatch = null;
    }

    if (!key) {
      this.asWriteable.loadingState = (key === null) ? LoadingState.NotFound : LoadingState.NotLoaded;
      return;
    }
    const ref = `${this.dbPath}/${key}`;

    isVerbose() && console.log(`watching for ${ref}`);
    this.asWriteable.loadingState = LoadingState.Loading;
    this.stopReaction();
    this.asWriteable.model = null;

    this.cancelFirebaseWatch = firebaseApp.database().ref(ref).on('value', (snapshot) => {
      let value: (MakeWritable<T> | null) = null;
      if (snapshot) {
        value = snapshot.val() as T;
      }
      if (value) {
        if (this.model) {
          this.suspendReaction = true;
          if (isVerbose()) {
            const updatedData = {};
            calculateUpdates(toJS(this.model), value, updatedData);
            console.log(`Firebase: Received new data for ${this.dbPath}: ${JSON.stringify(updatedData)}`);
          }
          this.model.assign(value);
          this.suspendReaction = false;

        } else {
          value.key = this._key;
          const model = new this.TCreator();
          model.assign(value);
          this.asWriteable.model = model;
        }
        this.asWriteable.loadingState = LoadingState.Loaded;
        this.previousModel = value;
        this.onLoaded && this.onLoaded();
      } else {
        this.asWriteable.loadingState = LoadingState.NotFound;
      }
    });
    this.startReaction();
  }

  stop() {
    this.stopReaction();
    if (this.cancelFirebaseWatch) {
      this.cancelFirebaseWatch(null);
    }
    this.cancelFirebaseWatch = null;
  }

  private stopReaction() {
    if (this.cancelModelChangeReaction) {
      this.cancelModelChangeReaction();
    }
    if (this.cancellerModelUpdatesReaction) {
      this.cancellerModelUpdatesReaction();
    }
    this.cancelModelChangeReaction =
      this.cancellerModelUpdatesReaction = null;
  }

  private startReaction() {
    isVerbose() && console.log(`startReaction on ${this.dbPath}`);
    this.cancelModelChangeReaction =
      reaction(() => toJS(this.model),
        (model) => {
          if (this.suspendReaction) {
            // console.log(`suspendReaction, ignoring`);
            return;
          }

          if (this.previousModel) {
            // console.log(`reaction triggered on ${this.dbPath}`);
            calculateUpdates(this.previousModel, model, this.updates);
            if (isVerbose() && Object.keys(this.updates)) {
              console.log(`detected updates to memory model ${this.dbPath}: ${JSON.stringify(this.updates, null, 2)}`);
            }
          }
        });

    this.cancellerModelUpdatesReaction =
      reaction(() => toJS(this.updates),
        (updates) => {
          if (Object.keys(updates).length) {
            isVerbose() && console.log(`writing updates to ${this.dbPath}: ${JSON.stringify(updates, null, 2)}`);
            this.model.put(updates);
            this.asWriteable.updates = {};
            this.previousModel = JSON.parse(JSON.stringify(this.model));
          }
        }, { delay: 100 });
  }

  private get asWriteable() {
    return this as MakeWritable<SynchronizedModelRunner<T>>;
  }
}