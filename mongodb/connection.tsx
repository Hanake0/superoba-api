import {Db, MongoClient} from 'mongodb'

export type MongoDBConnection = {
	Client: MongoClient,
	Db: Db
}

let cachedConnection: MongoDBConnection;

export async function getConnection(): Promise<MongoDBConnection> {
	if (cachedConnection.Client && cachedConnection.Db)
		return cachedConnection;

	const client: MongoClient = await MongoClient.connect(process.env.MONGODB_CONN_STRING)
	const db: Db = await client.db(process.env.MONGODB_DB_NAME)

	cachedConnection = {
		Client: client,
		Db: db
	}

	return cachedConnection;
}