import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthToken, SendPulseToken } from "../../../sendpulse/auth";
import checkAuth from "../../../auth/api-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse<SendPulseToken>) {
	if(checkAuth(req, res) == false) return;

	const body = req.body
	const tokenData = await getAuthToken(body['force_refresh'])

	res.status(200).json(tokenData);
}
