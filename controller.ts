import { IncomingMessage } from "http";
import * as cheerio from "cheerio"
import path, { join } from "node:path";
import { readFileSync, existsSync }  from "fs";

import { createUser, getUserTasks, Tasks } from "./db_implementations";

interface ResponseHeader {
	[key: string]: string | undefined;
	"content-type": string;
	"Access-Control-Allow-Origin": string;
	"set-cookie"?: string | undefined;
}

interface ServerErrorHeader {
	[key: string]: string | undefined;
	"content-type": string;
	"connection": string;
}

interface RedirectHeader {
	[key: string]: string | undefined;
	"location": string,
}

interface Response {
	codeStatus: number;
	header: ResponseHeader | ServerErrorHeader | RedirectHeader;
	body?: string;
}

const PROJECT_DIR = path.resolve(__dirname, "..");
export const COOKIE_TIMEOUT = 60 * 60 // 1 hour


function taskCreationPage(userReq: IncomingMessage): Response {
	let tasksHtml: string;

	if (!userReq.headers.cookie) {
		return {
			codeStatus: 302,
			header: {
				"location": "/"
			} as RedirectHeader
		};
	}

	try {
		tasksHtml = readFileSync(join(PROJECT_DIR, "public", "tasks.html"), "utf8")
	} catch (e) {
		return {
			codeStatus: 500,
			header: {
				"content-type": "plain/text",
				"connection": "close"
			} as ServerErrorHeader,
			body: "500 Server Error"
		};
	}

	// Wanna refactor this with union discrimination, so I know how to use it
	// and a valid use case properly
	return {
		codeStatus: 200,
		header: {
			"content-type": "text/html",
			"Access-Control-Allow-Origin": "*"
		} as ResponseHeader,
		body: tasksHtml
	}
}

async function mainPage(userReq: IncomingMessage): Promise<Response>{
	let indexHtml: string;

	try {
		indexHtml = readFileSync(join(PROJECT_DIR, "public", "index.html"), "utf8")
	} catch (e) {
		return {
			codeStatus: 500,
			header: {
				"content-type": "plain/text",
				"connection": "close"
			} as ServerErrorHeader,
			body: "500 Server Error"
		};
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

		// I'd like to remember, not prefixing async in promises inside async
		// functions mostly makes sense if you are returning another promise
		await createUser("sessionId=" + cookieId);

		const response: Response = {
			codeStatus: 200,
			header: response_header as ResponseHeader,
			body: indexHtml
		};

		return response;
	} else {
		// TODO: The whole task should be an anchor div that when
		// clicking, should send the UUID of the task to return the
		// whole description from the server
		const result = await getUserTasks(userReq.headers.cookie);

		if (typeof result === "object") {
			const $ = cheerio.load(indexHtml);
			for (let task in result as Tasks) {
				let title = result[task].title;
				let desc = result[task].description;
				// Wanna display only the first 100 chars of the desc
				desc = desc.length > 100 ? desc.substring(0, 100) + "..." : desc;

				$("body").append(`<div class=task data-uuid=${task}>
						 	<h3>${title}</h3>
						 	<p>${desc}</p>
						 </div>\n`
						);
			}
			$("body").append(`<script src="src/index.js"></script>`);
			indexHtml = $.html();
		}

		const response: Response = {
			codeStatus: 200,
			header: response_header as ResponseHeader,
			body: indexHtml
		};

		return response;
	}
}

export async function serverUrls(userReq: IncomingMessage): Promise<Response>
{
	if (userReq.url === "/")
		return mainPage(userReq);
	else if (userReq.url === "/createTask") {
		return taskCreationPage(userReq);
	}
	else {
		const resource = process.cwd() + "/public" + userReq.url;
		console.log(resource)
		if (existsSync(resource)) {
			console.log("The resource will be return: " + resource);
			return {
				codeStatus: 200,
				header: {
					"content-type": "text/html",
					"Access-Control-Allow-Origin": "*"
				},
				body: readFileSync(resource, "utf8")
			}
		}
		else {
			return {
				codeStatus: 404,
				header: {
					"content-type": "text/html",
					"Access-Control-Allow-Origin": "*"
				},
				body: "404 Not Found"
			};
		}

	}
}

