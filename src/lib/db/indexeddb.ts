import { openDB, IDBPDatabase } from 'idb';

export type DBSchema = {
    documents: {
        key: string;
        value: unknown;
        indexes: { [key: string]: unknown; }
    };
    lines: {
        key: string;
        value: unknown;
        indexes: { [key: string]: unknown; }
    };
    taxes: {
        key: string;
        value: unknown;
        indexes: { [key: string]: unknown; }
    };
    issuer: {
        key: string;
        value: unknown;
        indexes: { [key: string]: unknown; }
    };
    customers: {
        key: string;
        value: unknown;
        indexes: { [key: string]: unknown; }
    };
    errors: {
        key: string;
        value: unknown;
        indexes: { [key: string]: unknown; }
    };
    catalogs: {
        key: string;
        value: unknown;
        indexes: { [key: string]: unknown; }
    };
    batches: {
        key: string;
        value: unknown;
        indexes: { [key: string]: unknown; }
    };
};

let _db: IDBPDatabase<DBSchema> | null = null;

export async function getDB() {
    if (_db) return _db;
    _db = await openDB<DBSchema>('procesador-xml', 1, {
        upgrade(db) {
            const docs = db.createObjectStore('documents', { keyPath: 'id' });
            docs.createIndex('byIssuer', 'issuer.ruc');
            docs.createIndex('byCustomer', 'customer.docNumber');
            docs.createIndex('byDate', 'issueDate');
            docs.createIndex('bySerieNum', ['tipo', 'serie', 'numero']);
            docs.createIndex('byHash', 'hash');
        
            const lines = db.createObjectStore('lines', { keyPath: 'id'});
            lines.createIndex('byDocument', 'documentId');
        
            const taxes = db.createObjectStore('taxes', { keyPath: 'id'});
            taxes.createIndex('byDocument', 'documentId');
            
            const issuer = db.createObjectStore('issuer', { keyPath: 'id' });
            issuer.createIndex('byRuc', 'ruc');

            const customers = db.createObjectStore('customers', { keyPath: 'id' });
            customers.createIndex('byDoc', ['docType','docNumber']);

            const errors = db.createObjectStore('errors', { keyPath: 'id'});
            errors.createIndex('byDate', 'createdAt');

            const catalogs = db.createObjectStore("catalogs", { keyPath: "name" });
            catalogs.createIndex("byName", "name");

            const batches = db.createObjectStore("batches", { keyPath: "id" });
            batches.createIndex("byDate", "createdAt");

        }
    });
    return _db;
}