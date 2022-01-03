import fetch from "node-fetch";
import {getAuthToken} from "../auth";

export type SendPulseWhatsappBotsData = {
	success: boolean
	data: [ {
		id: string
		channel_data: {
			name: string,
			phone: bigint
		}
		inbox: {
			total: number,
			unread: number
		}
		status: 3 | 4
		created_at:	string // example: 2020-12-12T00:00:00+03:00
	}]
};

/**
 * Função para requisitar a lista de bots do SendPulse
 */
export async function getWhatsappBots(): Promise<SendPulseWhatsappBotsData> {
	let wppBots: SendPulseWhatsappBotsData = {
		success: false,
		data: null
	};

	const authToken = await getAuthToken();
	try {
		const headers = {
			"Content-Type": "application/json",
			"User-Agent": "SuperOba-Api-Client",
			"Authorization": `Bearer ${authToken.token.access_token}`
		}

		// Faz a requisição das informações
		const responseData = await (await fetch("https://api.sendpulse.com/whatsapp/bots",{
			method: "GET",
			headers: headers

			// Converte a resposta para json
		})).json();

		// Guarda as informações
		wppBots = {
			success: true,
			data: responseData["data"]
		};

		// Caso ocorra algum erro
	} catch (err) {
		console.log("Ocorreu um erro: ", err);
	}

	// Retorna as informações
	return wppBots;
}