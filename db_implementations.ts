import { connect } from "ts-postgres";

export default async function createDB(): Promise<void> {
	const psqlConnection = await connect({
		user: "Matixannder",
		host: "localhost",
		port: 5432,
		database: "TODOAppDB",
	});

	// This is the command that I'll use when I have to compare the timestamps
	// select * from users 
	// where cookie_expiration_date < NOW() at time zone 'utc';
	const createUserTable =
		`CREATE TABLE users (
			id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
			cookie_id VARCHAR(10),
			cookie_expiration_date_utc TIMESTAMP
	);`; 

	const createTasksTable = 
		`CREATE TABLE tasks (
			id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
			user_id BIGINT REFERENCES users (id),
			title varchar(255),
			description TEXT
	);`;


	try {
		await psqlConnection.query(createUserTable);
	} catch (e) {
		console.log("User's table already exists");
	}

	try {
		await psqlConnection.query(createTasksTable);
	}  catch (e) {
		console.log("Tasks table already exists");
	}

}
