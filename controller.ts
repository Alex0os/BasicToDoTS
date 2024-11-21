import { IncomingMessage, ServerResponse } from "http";

// It should return an object that specifies the responses options, like code
// status, headers, body, etc
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
	body: string;
}

const responseHeader: ResponseHeader = {
	"content-type": "text/html",
	"Access-Control-Allow-Origin": "*",
}

function mainPage(userReq: IncomingMessage): Response {
	let response: Response;

	if (!userReq.headers.cookie) {
		// Set cookie
		const cookieId = Math.floor(new Date().getTime() / 1000).toString(); // Date in seconds

		responseHeader["set-cookie"] =
		"sessionId=" + cookieId + "; Path=/; HttpOnly; Secure; Max-Age=" 
		+ COOKIE_TIMEOUT.toString() + ";" + "SameSite=Strict";

		response = {
			codeStatus: 200,
			header: responseHeader,
			body: "This is the main page"
		};
		return response;
	}

	response = {
		codeStatus: 200,
		header: responseHeader,
		body: "Your cookie is\n\n" + userReq.headers.cookie
	}
	return response;
}

export default function serverUrls(userReq: IncomingMessage): Response
{
	if (userReq.url === "/")
		return mainPage(userReq);
	else 
		return {
			codeStatus: 404,
			header: {
				"content-type": "text/html",
				"Access-Control-Allow-Origin": "*"
			},
			body: "404 Not Found"
	}

}

