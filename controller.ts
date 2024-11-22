import { IncomingMessage } from "http";
import path, { join } from "node:path";
import { readFileSync }  from "fs";


const PROJECT_DIR = path.resolve(__dirname, "..");
const COOKIE_TIMEOUT = 1 // 31 seconds

interface ResponseHeader {
	[key: string]: string | undefined;
	"content-type": string;
	"Access-Control-Allow-Origin": string;
	"set-cookie"?: string | undefined;
}

interface Response {
	codeStatus: number;
	header: ResponseHeader;
	body?: string;
}

function mainPage(userReq: IncomingMessage): Response {
	let htmlContent: string;

	try {
		htmlContent = readFileSync(join(PROJECT_DIR, "public", "index.html"), "utf8")
	} catch (e) {
		return {
			codeStatus: 500,
			// Look for a proper response header for a 500
			header: {
				"Access-Control-Allow-Origin": "*",
				"content-type": "plain/text"
			}
		}
	}

	let response: Response = {
		codeStatus: 200,
		header: {
			"Access-Control-Allow-Origin": "*",
			"content-type": "text/html"
		},
		body: htmlContent
	}

	if (!userReq.headers.cookie) {
		// Set cookie
		const cookieId = Math.floor(new Date().getTime() / 1000).toString(); // Date in seconds

		response.header["set-cookie"] =
		"sessionId=" + cookieId + "; Path=/; HttpOnly; Secure; Max-Age=" 
		+ COOKIE_TIMEOUT.toString() + ";" + "SameSite=Strict";
	} else {
		// Here I should implement the SSR of the tasks results on the
		// htmlContent
	}

	return response;
}

export default function serverUrls(userReq: IncomingMessage): Response
{
	if (userReq.url === "/")
		return mainPage(userReq);
	else {
		return {
			codeStatus: 404,
			header: {
				"content-type": "text/html",
				"Access-Control-Allow-Origin": "*"
			},
			body: "404 Not Found"
		}
	}
}

