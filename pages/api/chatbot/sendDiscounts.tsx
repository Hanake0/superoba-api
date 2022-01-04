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

	const dr: discountsRequestData = req.body as discountsRequestData;
	const igData: InstagramUserMediaData = await getUserMedia(dr.force_refresh);

	const now = new Date();
	const day: number = now.getDay();
	const month: string = mesesConvert[now.getMonth()];

	igData.data.filter(post => post.timestamp.getDay() === day);

	igData.data.forEach(post =>
		sendFreeMessage({
			contact_id: dr.contact_id,
			message: {
				type: "image",
				image: {
					link: post.permalink,
					caption: post.caption,
				}
			}
		})
	)

	res.status(200).json({sucesso: "Mensagens enviadas com sucesso"});
}