import { ObjectId } from "mongodb";

export default interface InstagramAccessToken {
	id?: ObjectId;
	account_id?: number;
	usage_time?: "LongLived" | "ShortLived";

	token: {
		access_token: string;
		token_type: string;
		expires_in: number
		created_at: number;
	};
	error: {
		friendly_message: string;
		error_message: string;
	};
}