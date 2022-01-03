import type { NextApiRequest, NextApiResponse } from 'next'
import {sendFreeMessage, SendPulseFreeMessageData} from "../../sendpulse/whatsapp/freeMessage";
import checkAuth from "../../auth/api-auth";

export default async function handler (req: NextApiRequest, res: NextApiResponse<SendPulseFreeMessageData>) {
	if(checkAuth(req, res) == false) return;

	const fmData = await sendFreeMessage({
		contact_id: '61cb649c8426776fae519c26',
		message: {
			type: "image",
			image: {
				link: 'https://s3.eu-central-1.amazonaws.com/whatsapp.sendpulse.prod/photos/69913f2b56da159ce034f68b70034eb5/5ea85d6c-c3d7-4e05-8193-f8d0b0ab173a.png',
				caption: 'Teste foda'
			}
		}
	})

	res.status(200).json(fmData)
};