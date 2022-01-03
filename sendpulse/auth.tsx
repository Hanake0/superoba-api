import fetch from "node-fetch";

const headers = {
	"Content-Type": "application/json",
	"User-Agent": "SuperOba-Api-Client"
}

export type SendPulseToken = {
	error: {
		friendly_message: string,
		error_message: string
	},
	token: {
		access_token: string,
		type: string,
		expires_in: number,
		created_at: number
	}
};

export type SendPulseAuthRequestData = {
	grant_type: string,
	client_id: string,
	client_secret: string
};

let cachedToken: SendPulseToken;

/**
 * Função para requisitar um token de acesso para a api da sendpulse
 * Se ainda houver um token válido na memória, retorna o token
 *
 * @param forceRefresh se deseja forçar o refresh do token
 */
export async function getAuthToken(forceRefresh: boolean = false): Promise<SendPulseToken> {

	// Caso token ainda não exista
	if (cachedToken === null || cachedToken === undefined)
		cachedToken = { error: {
				friendly_message: 'Token ainda não requerido',
				error_message: 'Token not requested yet'
			}, token: null };

	// Caso token expirado
	if (cachedToken.token && Date.now() > (cachedToken.token.created_at + cachedToken.token.expires_in - 30000))
		cachedToken.token = null;

	// Caso post com force_refresh: true
	if ( forceRefresh || cachedToken.token === null) {
		try {

			const data: SendPulseAuthRequestData = {
				grant_type: 'client_credentials',
				client_id: process.env.SP_CLIENT_ID,
				client_secret: process.env.SP_CLIENT_SECRET
			};

			// Faz a requisição de token
			const responseData = await (await fetch("https://api.sendpulse.com/oauth/access_token",{
				method: "POST",
				body: JSON.stringify(data),
				headers: headers

				// Converte a resposta para json
			})).json();

			// Guarda as informações do token na memória
			cachedToken = { error: null,
				token: {
					access_token: responseData['access_token'],
					type: responseData['token_type'],
					expires_in: responseData['expires_in'] * 1000,
					created_at: Date.now()
				} };

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

	// Retorna o token ou uma mensagem de erro
	return cachedToken;
}