import type { NextApiRequest, NextApiResponse } from 'next';
import { getWhatsappBots, SendPulseWhatsappBotsData } from "../../../../sendpulse/whatsapp/bots";
import checkAuth from "../../../../utils/api-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse<SendPulseWhatsappBotsData>) {
	if(checkAuth(req, res) == false) return;

	const wppBots = await getWhatsappBots();

	res.status(200).json(wppBots);
}
