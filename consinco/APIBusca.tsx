import fetch from "node-fetch";


export type Produto = {
	id_produto: number,
	str_id_integrador: string,
	str_nom_produto: string,
	mny_vlr_produto_de: number,
	mny_vlr_produto_por: number,
	bit_esgotado: boolean,

	// Imagem do produto
	str_img_path: string,
	str_img_path_cdn: string,
}
export type Avaliacao = {
	int_nota_review: number,
	int_qtd_produto: number,
}

export type ApiBuscaResponse = {
	Produtos: Produto[],
	Banners: unknown,
	Categorias: unknown,
	Precos: unknown,
	Avaliacoes: Avaliacao[],
	Promocoes: unknown,
}
export type ApiBuscaRequest = {
	descricao: string,

	// MV = Mais Vendidos, PD = Menor Preço, PU = Maior Preço,
	// MR = Mais Recentes, AZ = A-Z, ZA = Z-A
	order: "MV" | "PD" | "PU" | "MR" | "AZ" | "ZA",
	pg: number,
	marcas: [],
	categorias: [],
	subcategorias: [],
	precoIni: 0,
	precoFim: 0,
	avaliacoes: [],
	num_reg_pag: number,
	visualizacao: "CARD" | "LIST",
	q: string
}

export default async function buscarProdutos(busca: string, pagina: number = 1, nr_resultados: string = '4',
                                             ordem: string = "MV"): Promise<ApiBuscaResponse> {

	// Payload da request
	const request: ApiBuscaRequest = {
		descricao: busca,
		q: busca,
		pg: pagina,
		num_reg_pag: Number(nr_resultados),

		// @ts-ignore
		order: ordem,

		// Desnecessário
		visualizacao: "LIST",
		marcas: [],
		categorias: [],
		subcategorias: [],
		avaliacoes: [],

		precoIni: 0,
		precoFim: 0,
	}

	try {
		const headers = {
			"Content-Type": "application/json",
			"User-Agent": "SuperOba-Api-Client",
		}

		// Faz a requisição dos dados
		return await (await fetch("https://superoba.com.br/api/busca",{
			method: "POST",
			body: JSON.stringify(request),
			headers: headers

			// Converte a resposta para json
		})).json() as ApiBuscaResponse;

		// Caso ocorra algum erro
	} catch (err) {
		console.log("Ocorreu um erro: ", err);
		return {
			Produtos:   [], Banners:   [],
			Categorias: [], Precos:    [],
			Avaliacoes: [],	Promocoes: [],
		};
	}
}
