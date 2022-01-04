import type { NextApiRequest, NextApiResponse } from 'next'
import checkAuth from "../../auth/api-auth";
import {getUserMedia, InstagramUserMediaData} from "../../instagram/media";

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
	if(checkAuth(req, res) == false) return;

	const igData: InstagramUserMediaData = await getUserMedia();
	console.log(igData.data[1].timestamp.getDay());

	res.status(200).json(igData);
};