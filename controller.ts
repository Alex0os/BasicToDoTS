import { IncomingMessage } from "http";
import path, { join } from "node:path";
import { readFileSync }  from "fs";

interface ResponseHeader {
	[key: string]: string | undefined;
	"content-type": string;
	"Access-Control-Allow-Origin": string;
	"set-cookie"?: string | undefined;
}

interface ErrorHeader {
	[key: string]: string | undefined;
	"content-type": string;
	"connection": string;
}

interface Response {
	codeStatus: number;
	header: ResponseHeader | ErrorHeader;
	body?: string;
}

const PROJECT_DIR = path.resolve(__dirname, "..");
const COOKIE_TIMEOUT = 1 // 1 seconds

function mainPage(userReq: IncomingMessage): Response {
	let htmlContent: string;

	try {
		htmlContent = readFileSync(join(PROJECT_DIR, "public", "index.html"), "utf8")
	} catch (e) {
		return {
			codeStatus: 500,
			header: {
				"content-type": "plain/text",
				"connection": "close"
			} as ErrorHeader,
			body: "500 Server Error"
		}
	}

	const response_header: ResponseHeader = {
		"Access-Control-Allow-Origin": "*",
		"content-type": "text/html"
	}

	if (!userReq.headers.cookie) {
		const cookieId = Math.floor(new Date().getTime() / 1000).toString(); // Date in seconds
		response_header["set-cookie"] =
		"sessionId=" + cookieId + "; Path=/; HttpOnly; Secure; Max-Age=" 
		+ COOKIE_TIMEOUT.toString() + ";" + "SameSite=Strict";
	} else {
		// Here I should implement the SSR of the tasks results on the
		// htmlContent
	}

	const response: Response = {
		codeStatus: 200,
		header: response_header as ResponseHeader,
		body: htmlContent
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

