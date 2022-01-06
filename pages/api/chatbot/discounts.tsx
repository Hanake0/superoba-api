import type { NextApiRequest, NextApiResponse } from 'next';
import checkAuth from "../../../auth/api-auth";
import {getUserMedia, InstagramUserMediaData} from "../../../instagram/media";
import {sendFreeMessage} from "../../../sendpulse/whatsapp/freeMessage";

export type discountsRequestData = {
	contact_id: string,
	force_refresh: boolean,
	valid_days: "valid" | "today" | "week"
}

export const mesesConvert = {
	1: "Janeiro",
	2: "Fevereiro",
	3: "Março",
	4: "Abril",
	5: "Maio",
	6: "Junho",
	7: "Julho",
	8: "Agosto",
	9: "Setembro",
	10: "Outubro",
	11: "Novembro",
	12: "Dezembro",
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if(checkAuth(req, res) == false) return;
	res.status(200).json({sucesso: "Mensagens serão enviadas"})

	const dr: discountsRequestData = req.body as discountsRequestData;
	const igData: InstagramUserMediaData = await getUserMedia(dr.force_refresh);

	const now = new Date();
	const day: number = now.getUTCDate();
	const month: number = now.getUTCMonth();

	// Filtra para apenas imagens e Albums de imagens
	//igData.data = igData.data.filter(post => (post.media_type === "IMAGE" || post.media_type === "CAROUSEL_ALBUM"));


	// Filtra as postagens
	if (dr.valid_days === "valid") {
		/*
		const regexInicio = /Ofertas\sválidas\ssomente/im;
		const regexFim = /\so\sestoque/im;
		const regexDatas = /((\d{1,2}\/\d{1,2})(,\s|\se\s)?)+/im;
		*/

	} else if(dr.valid_days === "today") {
		igData.data = igData.data.filter(post =>
			(post.timestamp.getUTCMonth() === month)  // Mesmo mês
			&& (post.timestamp.getUTCDate() === day) ); // Mesmo dia do mês

	} else if(dr.valid_days === "week")
		igData.data = igData.data.filter(post =>
			(post.timestamp.getUTCMonth() === month)       // Mesmo mês
			&& (post.timestamp.getUTCDate() >= (day - 7) )); // Dia do mês maior que 7 dias antes do atual




	// Envia todas as postagens
	igData.data.forEach(post => {
		if(post.media_type === "IMAGE") sendFreeMessage({
			contact_id: dr.contact_id,
			message: { type: "image",
				image: { link: post.media_url} }
		});
		else if(post.media_type === "CAROUSEL_ALBUM") post.children.data.forEach(children =>
			sendFreeMessage({
				contact_id: dr.contact_id,
				message: { type: "image",
					image: { link: children.media_url} }
			})
		);
		else if(post.media_type === "VIDEO") {
				const dia: number = post.timestamp.getDate();
				const mes: number = post.timestamp.getMonth() + 1;
				const ano: number = post.timestamp.getFullYear();
				const data: string = `${dia < 9 ? `0${dia}` : dia}/` +
					`${mes < 9 ? `0${mes}` : mes}/` + `${ano}`;

				sendFreeMessage({
						contact_id: dr.contact_id,
						message: { type: "document",
							document: { link: post.media_url,
								caption: `Ofertas---${data}`} }
					});
		}
	})

	// Caso não tenha nenhuma postagem

	//res.status(200).json({sucesso: "Mensagens enviadas com sucesso"});
}