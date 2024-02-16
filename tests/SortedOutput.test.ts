import {describe, expect, test} from 'vitest';
import {Parser} from '../src/core/Parser';
import fs from 'fs';

const
	parser = new Parser(),
	getPathToScenarioFile = (id: number,): string => `${__dirname}/inputScenarios/scenario${id}.ts`,
	loadExpectedOutput = (id: number): string => {
		console.log({wut: `${__dirname}/outputScenarios/scenario${id}.ts`});

		return fs.readFileSync(`${__dirname}/outputScenarios/scenario${id}.ts`, 'utf-8');
	};

describe('Compare sorted output', () => {
	test('Scenario #1', () => {
		expect(parser.getOutputForSourceFile(getPathToScenarioFile(1)))
			.toBe(loadExpectedOutput(1));
	});
});
