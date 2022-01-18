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
	items_per_page: '' | '4' | '10' ,
	current_item?: number,
}

export type PricesResponse = {
	success: boolean,

	total_pages: number,
	needs_next_page_button: 0 | 1,
	needs_previous_page_button: 0 | 1,
}

const validOrders = ['MV', 'PD', 'PU', 'MR', 'AZ', 'ZA'];
const validItemsPerPage = ['4', '10'];

export default async function handler(req: NextApiRequest, res: NextApiResponse<PricesResponse>) {
	if(checkAuth(req, res) == false) return;

	const pr: PricesRequest = req.body as PricesRequest;

	pr.items_per_page = (!validItemsPerPage.includes(pr.items_per_page)) ? '10' : pr.items_per_page;
	pr.order = (!validOrders.includes(pr.order)) ? 'MV' : pr.order;

	const results = await buscarProdutos(pr.search, Number(pr.page), pr.items_per_page, pr.order);

	if(pr.current_item) {
		const friendlyMessage = StringUtils
			.createList(results.Produtos.filter((p, i) => i === pr.current_item));

		await sendFreeMessage({
			contact_id: pr.contact_id, message: { type: "image", image: {
					link: results.Produtos[pr.current_item].str_img_path_cdn,
					caption: friendlyMessage,
				}}
		});
	} else {
		const productList = StringUtils.createList(results.Produtos);

		await sendFreeMessage({
			contact_id: pr.contact_id,
			message: { type: "text", text: { body: productList } }
		});
	}

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