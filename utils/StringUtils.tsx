import {Produto} from "../consinco/APIBusca";

export default class StringUtils {
	static maxPrdName = 31;

	static limitSize = function(str: string, lSize: number = 34): string[] {
		let res = [];

		// Se couber em uma linha
		if(str.length <= lSize) {
			res.push(StringUtils.appendSpaces(str, lSize));

			// Se precisar de mais de uma linha
		} else if(str.length > lSize) {
			res = StringUtils.separeWords(str, lSize)
		}

		return res;
	}

	static separeWords(str: string, desiredSize: number): string[] {
		let res = [];

		let size = desiredSize;
		do {
			if(str.charAt(size) == ' ' || (str.charAt(size) == '' && str.length > 0)) {
				res.push(
					StringUtils.appendSpaces(str.substr(0, size), desiredSize));
				str = str.substr(size).trim();

				size = desiredSize;

			} else do {
				size--;
			} while (str.charAt(size) != ' ' && size > 0)
		} while (str.length > 0);

		return res;
	}

	static appendSpaces = function (str: string, targetSize: number): string {
		if(str.length > targetSize) return str;
		str += ' '.repeat(targetSize - str.length)

		return str;
	}
	
	static createList = function (produtos: Produto[]): string {
		let str = '```';

		str += '--------------------------------------\n';
		if(produtos.length > 0)	for (const produto of produtos) {
			const name: string[] = StringUtils.limitSize(produto.str_nom_produto);

			str += `|            --Produto--             |\n`;
			for (const part of name) str += `| ${part} |\n`;

			if(produto.bit_esgotado) str += `|          PRODUTO ESGOTADO          |\n`
			else str += `|         Valor: R$ ${StringUtils.limitSize(String(produto.mny_vlr_produto_por), 17)}|\n`;
			if (produtos.indexOf(produto) != (produtos.length-1))
				str += '--------------------------------------\n';
			else str += '--------------------------------------';

		// Caso a busca não tenha nenhum resultado
		} else {

			str += '|           SEM RESULTADOS           |\n'
			str += '--------------------------------------';
		}

		str += '```';
 		return str;
	}

	static formatProduct = function (produto: Produto): string {
		let str = '```';

		str += '--------------------------------------\n';
		const name: string[] = StringUtils.limitSize(produto.str_nom_produto);

		str += `|              --Nome--              |\n`;
		for (const part of name) str += `| ${part} |\n`;

		if(produto.bit_esgotado) str += `|          PRODUTO ESGOTADO          |\n`
		else str += `|         Valor: R$ ${StringUtils.limitSize(String(produto.mny_vlr_produto_por), 17)}|\n`;
		str += '--------------------------------------';

		str += '```';
		return str;
	}
}