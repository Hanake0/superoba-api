import type { NextApiRequest, NextApiResponse } from 'next'
import delay from "../../utils/delay";

export type delayRequest = {
	time: number,
}

export type delayResponse = {
	success?: string,
	error?: string,
}

export default async function handler (req: NextApiRequest, res: NextApiResponse<delayResponse>) {

	const dr = req.body as delayRequest;

	if (!Number.isInteger(dr.time))
		return res.status(400).json({error: `${dr.time} is not an integer`});

	await delay(dr.time);
	res.status(200).json({success: `awaited ${dr.time}ms`});
};