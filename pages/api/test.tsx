import type { NextApiRequest, NextApiResponse } from 'next'
import checkAuth from "../../utils/api-auth";
import fetch from "node-fetch";
import {sendFreeMessage} from "../../sendpulse/whatsapp/freeMessage";

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
	if(checkAuth(req, res) == false) return;

	let responseData;
	try {
		const headers = {
			"Content-Type": "application/json",
			"User-Agent": "SuperOba-Api-Client",
		}

		// Faz a requisição do envio da mensagem
		responseData = await (await fetch("https://superoba.com.br/api/busca",{
			method: "POST",
			body: JSON.stringify({
				descricao: "alcatra",
				order: "MV",
				pg: 1,
				marcas: [],
				categorias: [],
				subcategorias: [],
				precoIni: 0,
				precoFim: 0,
				avaliacoes: [],
				num_reg_pag: 1,
				visualizacao: "CARD",
				q: "alcatra"
			}),
			headers: headers

			// Converte a resposta para json
		})).json();

		// Caso ocorra algum erro
	} catch (err) {
		console.log("Ocorreu um erro: ", err);
	}

	const produto = responseData['Produtos'][0];
	await sendFreeMessage({
		contact_id: "61cb649c8426776fae519c26",
		message: {
			type: "image",
			image: {
				link: produto['str_img_path_cdn'],
				caption: `${produto['str_nom_produto']} -- R$ ${produto['mny_vlr_produto_por']}`
			}
		}
	})

	res.status(200).json(responseData);
};