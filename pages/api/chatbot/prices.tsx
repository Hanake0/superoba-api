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
	page: string,
	items_per_page: '' | '1' | '4' | '8' | '10' | '15',
}

export type PricesResponse = {
	success: boolean,

	total_pages: number,
	needs_next_page_button: 0 | 1,
	needs_previous_page_button: 0 | 1,
}

const validOrders = ['MV', 'PD', 'PU', 'MR', 'AZ', 'ZA'];
const validItemsPerPage = ['1', '4', '8', '10', '15'];

export default async function handler(req: NextApiRequest, res: NextApiResponse<PricesResponse>) {
	if(checkAuth(req, res) == false) return;

	const pr: PricesRequest = req.body as PricesRequest;

	pr.items_per_page = (!validItemsPerPage.includes(pr.items_per_page)) ? '10' : pr.items_per_page;
	pr.order = (!validOrders.includes(pr.order)) ? 'MV' : pr.order;

	const results = await buscarProdutos(pr.search, Number(pr.page), pr.items_per_page, pr.order);

	const friendlyMessage = StringUtils.createList(results.Produtos);
	if(pr.items_per_page === '1' && results.Produtos.length !== 0)
		await sendFreeMessage({
			contact_id: pr.contact_id, message: { type: "image", image: {
				link: results.Produtos[0].str_img_path_cdn,
				caption: friendlyMessage,
			}}
	}); else await sendFreeMessage({
		contact_id: pr.contact_id,
		message: { type: "text", text: { body: friendlyMessage } }
	});

	const qtdRes = results.Avaliacoes[0].int_qtd_produto;
	const totalPages = Math.ceil(qtdRes/Number(pr.items_per_page));

	const needsNP = totalPages > Number(pr.page);
	const needsPP = Number(pr.page) > 1;

	res.status(200).json({
		success: true,

		total_pages: totalPages,
		needs_next_page_button: needsNP ? 1 : 0,
		needs_previous_page_button: needsPP ? 1 : 0,
	});
}