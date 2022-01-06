import type { NextApiRequest, NextApiResponse } from 'next'
import checkAuth from "../../auth/api-auth";

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
	if(checkAuth(req, res) == false) return;

	res.status(200).json({eee: "eita??"});
};