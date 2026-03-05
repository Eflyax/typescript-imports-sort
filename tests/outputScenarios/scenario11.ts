// Scenario 11: Numeric enum → sort by value; string enum → sort alphabetically

export enum EStatusCodes {
	Aborted = 0,
	Ok = 200,
	Unauthorized = 401,
	NotFound = 404,
	ServerError = 500,
	BadGateway = 502,
}

export enum EDirection {
	Down = 'DOWN',
	Left = 'LEFT',
	Right = 'RIGHT',
	Up = 'UP',
}
