import {NextApiRequest, NextApiResponse} from "next";
import InstagramAccessToken from "../../../mongodb/models/InstagramAccessToken";
import {getAccessToken} from "../../../instagram/auth";

/***
 * Api route para conceder acesso automaticamente
 * para a página do Instagram do 'bot'
 */
export default async function handler (req: NextApiRequest, res: NextApiResponse) {
	const code: string = req.query["code"] as string;

	// Caso não tenha sido redirecionado do Instagram, redirecionar de volta para autorizar
	if(code === undefined || code === null) {
		const appId = process.env.IG_APP_ID;
		const redirectUri = process.env.IG_REDIRECT_URI;
		const scope = "user_profile,user_media," +
			"instagram_graph_user_profile,instagram_graph_user_media";

		return res.redirect(307, "https://api.instagram.com/oauth/authorize" +
			`?client_id=${appId}` +
			`&redirect_uri=${redirectUri}` +
			`&scope=${scope}` +
			'&response_type=code');
	}

	const token: InstagramAccessToken = await getAccessToken(code);

	if(token.token)
		res.status(200).json({sucesso: 'Bot Autorizado com sucesso'})
	else
		res.status(500).json(token)
};