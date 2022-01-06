import fetch from "node-fetch";
import {getAuthToken} from "../auth";

export type SendPulseFreeMessageRequestData = {
	contact_id: string,
	message: {
		type: 'text' | 'image' | 'document',
		text?: { body: string }
		image?: { link: string, caption?: string }
		document?: { link: string, caption?: string }
	}
}

export type SendPulseFreeMessageData = {
	success: boolean,
	data?: any
};

/**
 * TODO: Documentação
 */
export async function sendFreeMessage(messageData: SendPulseFreeMessageRequestData): Promise<SendPulseFreeMessageData> {
	let fmData: SendPulseFreeMessageData = {
		success: false
	};

	const authToken = await getAuthToken();
	try {

		const headers = {
			"Content-Type": "application/json",
			"User-Agent": "SuperOba-Api-Client",
			"Authorization": `${authToken.token.type} ${authToken.token.access_token}`
		}

		// Faz a requisição do envio da mensagem
		const responseData = await (await fetch("https://api.sendpulse.com/whatsapp/contacts/send",{
			method: "POST",
			body: JSON.stringify(messageData),
			headers: headers

			// Converte a resposta para json
		})).json();

		// Guarda as informações
		if (responseData["success"]) {
			fmData = { success: responseData['success'], data: responseData['data'] };
		} fmData = { success: false, data: responseData };

		// Caso ocorra algum erro
	} catch (err) {
		console.log("Ocorreu um erro: ", err);
	}

	// Retorna success: true ou false
	return fmData;
}