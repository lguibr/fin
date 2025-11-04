import { openDB, DBSchema } from 'idb';
import { Projection, Transaction, ProjectionSettings } from '../types';

const DB_NAME = 'financial-planner-db';
const DB_VERSION = 2; // Incremented version for schema change
const PROJECTIONS_STORE = 'projections';

interface FinancialDB extends DBSchema {
  [PROJECTIONS_STORE]: {
    key: string;
    value: Projection;
  };
}

const dbPromise = openDB<FinancialDB>(DB_NAME, DB_VERSION, {
  upgrade(db, oldVersion) {
    if (oldVersion < 2) {
        if (db.objectStoreNames.contains(PROJECTIONS_STORE)) {
            db.deleteObjectStore(PROJECTIONS_STORE);
        }
        db.createObjectStore(PROJECTIONS_STORE, { keyPath: 'id' });
    }
  },
});

export const getProjections = async (): Promise<Projection[]> => {
  return (await dbPromise).getAll(PROJECTIONS_STORE);
};

export const getProjection = async (id: string): Promise<Projection | undefined> => {
    return (await dbPromise).get(PROJECTIONS_STORE, id);
};

export const saveProjection = async (projection: Projection): Promise<void> => {
  const tx = (await dbPromise).transaction(PROJECTIONS_STORE, 'readwrite');
  await tx.store.put(projection);
  await tx.done;
};

export const deleteProjection = async (id: string): Promise<void> => {
  const tx = (await dbPromise).transaction(PROJECTIONS_STORE, 'readwrite');
  await tx.store.delete(id);
  await tx.done;
};