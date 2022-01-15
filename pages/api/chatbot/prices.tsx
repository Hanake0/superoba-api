import type { NextApiRequest, NextApiResponse } from 'next';
import checkAuth from "../../../utils/api-auth";
import {sendFreeMessage} from "../../../sendpulse/whatsapp/freeMessage";
import buscarProdutos from "../../../consinco/APIBusca";
import StringUtils from "../../../utils/StringUtils";

export type PricesRequest = {
	contact_id: string,
	force_refresh: boolean,

	search: string,
	order: '' | 'MV' | 'PD' | 'PU' | 'MR' | 'AZ' | 'ZA',
	page: number,
	items_per_page: '' | '4' | '8' | '15',
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if(checkAuth(req, res) == false) return;

	const pr: PricesRequest = req.body as PricesRequest;
	const results = await buscarProdutos(pr.search, pr.page,
		pr.items_per_page == '' ? '4' : pr.items_per_page,
		pr.order == '' ? 'MV' : pr.order);

	const friendlyMessage = StringUtils.createList(results);
	await sendFreeMessage({
		contact_id: pr.contact_id,
		message: { type: "text", text: { body: friendlyMessage} }
	});

	res.status(200).json({sucesso: "Mensagens enviadas com sucesso"});
}