import {configuration} from '../src/configuration';
import {describe, expect, test} from 'vitest';
import {Parser} from '../src/core/Parser';
import fs from 'fs';

export class MyClass {
	constructor() {
		this.myProperty = 'Hello, World!';
	}
}

export class AnotherClass {
	constructor() {
		this.anotherProperty = 'Another Property';
	}
}
