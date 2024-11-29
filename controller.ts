import { IncomingMessage } from "http";
import path, { join } from "node:path";
import { readFileSync }  from "fs";
import { createUser, getUserTasks } from "./db_implementations";

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

// Let's create the implementation that will allow the user to create the task
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

function mainPage(userReq: IncomingMessage): Response {
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

		createUser("sessionId=" + cookieId);
	} else {
		console.log("User already exists -> " + userReq.headers.cookie);


		// The thing here is that, if I have to return the response inside of
		// here, it will force me to return the object inside a promise, so
		// I'll have to re-structure the whole code
		//
		// TODO: Find a way to make the function wait for the promise to
		// resolve or reject before it returns
		//
		// Otherwise, just re-write the code, it'll be fun (lie to me).

		getUserTasks(userReq.headers.cookie)
		.then((result) => {
			console.log("The user tasks are:\n\n");
			console.log(result);
		}).
		catch(rej => console.log("The error is -> " +  rej)).
		then(() => {
			console.log("So here you should return");
		});
	}
	

	const response: Response = {
		codeStatus: 200,
		header: response_header as ResponseHeader,
		body: indexHtml
	};

	return response;
}

export function serverUrls(userReq: IncomingMessage): Response
{
	if (userReq.url === "/")
		return mainPage(userReq);
	else if (userReq.url === "/createTask") {
		return taskCreationPage(userReq);
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

