import { Collection, Db, MongoClient } from 'mongodb';

export type MongoDBConnection = {
	Client: MongoClient,
	Db: Db,
	InstagramTokens: Collection,
}

let cachedConnection: MongoDBConnection;

export async function getConnection(): Promise<MongoDBConnection> {
	if ( cachedConnection && cachedConnection.Client && cachedConnection.Db )
		return cachedConnection;

	const client: MongoClient = await MongoClient.connect(process.env.MONGODB_CONN_STRING);
	const db: Db = await client.db(process.env.MONGODB_DB_NAME);
	const igTokens = await db.collection("Instagram");

	cachedConnection = {
		Client: client,
		Db: db,
		InstagramTokens: igTokens,
	};

	return cachedConnection;
}