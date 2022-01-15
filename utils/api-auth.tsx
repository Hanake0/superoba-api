import {NextApiRequest, NextApiResponse} from "next";

export default function checkAuth(req: NextApiRequest, res: NextApiResponse): boolean {
	const body = req.body
	if(body['passwd'] !== process.env.API_ENCODED_PASSWD) {
		res.status(403).json({error: {
				friendly_message: "Senha incorreta para acessar os dados",
				error_message: "The provided passwd is invalid"
			}});
		return false;
	}

	return true;
}