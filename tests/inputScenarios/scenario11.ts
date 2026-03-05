// Scenario 11: Numeric enum → sort by value; string enum → sort alphabetically

export enum EStatusCodes {
	Unauthorized = 401,
	Ok = 200,
	Aborted = 0,
	BadGateway = 502,
	NotFound = 404,
	ServerError = 500,
}

export enum EDirection {
	Up = 'UP',
	Down = 'DOWN',
	Left = 'LEFT',
	Right = 'RIGHT',
}
