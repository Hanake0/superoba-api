import fetch from "node-fetch";
import InstagramAccessToken from "../mongodb/models/InstagramAccessToken";
import {getConnection, MongoDBConnection} from "../mongodb/connection";

const headers = {
	"Content-Type": "application/json",
	"User-Agent": "SuperOba-Api-Client"
}

export type InstagramShortLivedRequestData = {
	client_id: string,
	client_secret: string,
	code: string,
	grant_type: "authorization_code",
	redirect_uri: string,
};

export type InstagramLongLivedRequestData = {
	grant_type: "ig_exchange_token",
	client_secret: string,
	access_token: string,
};

let cachedToken: InstagramAccessToken;

/**
 * TODO: Documentação
 */
export async function getAccessToken(code: string = null): Promise<InstagramAccessToken> {
	if(code) cachedToken = await getShortLivedToken(code);
	else {
		const dbConn: MongoDBConnection = await getConnection();
		cachedToken = await dbConn.InstagramTokens.findOne<InstagramAccessToken>();
		cachedToken.token.expires_in = Number(cachedToken.token.expires_in);
		cachedToken.token.created_at = Number(cachedToken.token.created_at);
	}

	// Caso token ainda não exista
	if (cachedToken === null || cachedToken === undefined)
		return cachedToken = { error: {
				friendly_message: 'Token ainda não requerido',
				error_message: 'Token not requested yet'
			}, token: null };

	// Caso o token precise ser convertido
	if (cachedToken.token && cachedToken.usage_time === "ShortLived") {
		try {
			const data: InstagramLongLivedRequestData = {
				grant_type: "ig_exchange_token",
				client_secret: process.env.IG_APP_SECRET,
				access_token: cachedToken.token.access_token,
			};

			// Faz a requisição de token
			const responseData = await (await fetch('https://graph.instagram.com/access_token', {
				method: "POST",
				body: JSON.stringify(data),
				headers: headers

				// Converte a resposta para json
			})).json();

			// Guarda as informações do token na memória
			cachedToken = {
				error: null,
				usage_time: "LongLived",
				token: {
					access_token: responseData['access_token'],
					token_type: responseData['token_type'],
					expires_in: responseData['expires_in'] * 1000,
					created_at: Date.now()
				}
			};

			// Caso ocorra algum erro
		} catch (err) {
			console.log("Ocorreu um erro: ", err);
			cachedToken = {
				error: {
					friendly_message: 'Erro ao requisitar token',
					error_message: err.message
				},
				token: null
			};
		}
	}

	// Caso o token possa ser recarregado
	if (Date.now() > (cachedToken.token.created_at + (86400 * 1000))) {
		try {
			// Faz a requisição de token
			const responseData = await (await fetch('https://graph.instagram.com/refresh_access_token' +
				`?grant_type=ig_refresh_token&access_token=${cachedToken.token.access_token}`, {
				method: "GET",
				headers: headers

				// Converte a resposta para json
			})).json();

			// Caso tenha conseguido dar refresh com sucesso
			if(responseData["access_token"]) {
				// Atualiza as informações do token na memória
				cachedToken = {
					_id: cachedToken._id,
					account_id: cachedToken.account_id,
					error: null,
					usage_time: "LongLived",
					token: {
						access_token: responseData['access_token'],
						token_type: responseData['token_type'],
						expires_in: responseData['expires_in'] * 1000,
						created_at: Date.now()
					}
				};
			}

			const dbConn: MongoDBConnection = await getConnection();
			await dbConn.InstagramTokens.replaceOne({ _id: cachedToken._id }, cachedToken);

			// Caso ocorra algum erro
		} catch (err) {
			console.log("Ocorreu um erro: ", err);
			cachedToken = {
				error: {
					friendly_message: 'Erro ao requisitar token',
					error_message: err.message
				},
				token: cachedToken.token,
			};
		}
	}

	// Retorna o token ou uma mensagem de erro
	return cachedToken;
}

export async function getShortLivedToken(code: string): Promise<InstagramAccessToken> {
	try {
		const data: InstagramShortLivedRequestData = {
			client_id: process.env.IG_APP_ID,
			client_secret: process.env.IG_APP_SECRET,
			code: code,
			grant_type: "authorization_code",
			redirect_uri: process.env.IG_REDIRECT_URI

		};

		// Faz a requisição de token
		const responseData = await (await fetch("https://api.instagram.com/oauth/authorize", {
			method: "POST",
			body: JSON.stringify(data),
			headers: headers

			// Converte a resposta para json
		})).json();

		if(responseData["error_type"]) {
			cachedToken = {
				error: {
					friendly_message: "Ocorreu um erro ao requisitar o token de acesso do instagram",
					error_message: responseData["error_message"]
				}, token: null
			}
		} else {
			// Guarda as informações do token na memória
			cachedToken = {
				error: null,
				usage_time: "ShortLived",
				token: {
					access_token: responseData['access_token'],
					token_type: null,
					expires_in: Date.now() + (3600 * 1000),
					created_at: Date.now()
				}
			};
		}

		// Caso ocorra algum erro
	} catch (err) {
		console.log("Ocorreu um erro: ", err);
		cachedToken = {
			error: {
				friendly_message: 'Erro ao requisitar token',
				error_message: err.message
			},
			token: null
		};
	}

	return cachedToken;
}