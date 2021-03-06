import fetch from "node-fetch";
import InstagramAccessToken from "../mongodb/models/InstagramAccessToken";
import {getAccessToken} from "./auth";

export type InstagramUserMediaData = {
	created_at: number,
	data: InstagramUserMedia[],
	error?: {
		friendly_message: string,
		error_message: string
	}
};

export type InstagramUserMedia = {
	id: string,
	media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM",
	caption: string,
	media_url: string,
	permalink?: string,
	children?: {
		data: InstagramPostChildren[],
	},
	thumbnail_url?: string,
	timestamp: Date,
	username: string,
}

export type InstagramPostChildren = {
	id: string,
	media_url: string,
	timestamp: string,
}

const headers = {
	"Content-Type": "application/json",
	"User-Agent": "SuperOba-Api-Client",
}

let cachedData: InstagramUserMediaData;

/**
 * TODO: Documentação
 */
export async function getUserMedia(forceRefresh: boolean = false, userId: string = "me/media"): Promise<InstagramUserMediaData> {

	// Caso forceRefresh: true ou informações com mais de 20 segundos
	if( !cachedData || forceRefresh || (Date.now() - cachedData.created_at > 20000) ) try {
		//const igToken: InstagramAccessToken = await getAccessToken();

		// Faz a requisição dos posts
		const responseData = await (await fetch(`https://graph.instagram.com/${userId}` +
			'?fields=id,media_type,caption,media_url,permalink,thumbnail_url,timestamp,username' +
			',children{id,media_url,timestamp}' +
			`&access_token=${process.env.IG_PROFILE_TOKEN}`,{
			method: "GET",
			headers: headers

			// Converte a resposta para json
		})).json();

		// Guarda as informações
		if (responseData['error']) cachedData = {
				created_at: Date.now(), data: null,
				error: responseData['error'],
			};
		else {

			// Converte as strings de data para Date
			const data = responseData['data'] as InstagramUserMedia[];
			data.forEach( post => post.timestamp = new Date(post.timestamp) );

			cachedData = {
				created_at: Date.now(),
				data: data as InstagramUserMedia[],
			};
		}

		// Caso ocorra algum erro
	} catch (err) {
		console.log("Ocorreu um erro: ", err);
		cachedData = {
			created_at: Date.now(), data: null,
			error: {
				friendly_message: "Ocorreu um erro ao requisitar os posts no instagram",
				error_message: err,
			}
		}
	}

	return cachedData
}