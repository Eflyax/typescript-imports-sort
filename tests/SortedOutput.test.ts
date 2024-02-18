import {describe, expect, test} from 'vitest';
import {Parser} from '../src/core/Parser';
import fs from 'fs';

const
	getPathToScenarioFile = (id: number,): string => `${__dirname}/inputScenarios/scenario${id}.ts`,
	loadExpectedOutput = (id: number): string => {
		return fs.readFileSync(`${__dirname}/outputScenarios/scenario${id}.ts`, 'utf-8');
	};

describe('Compare sorted output', () => {
	test('Scenario #1', () => {
		const
			parser = new Parser();

		expect(parser.getOutputForSourceFile(getPathToScenarioFile(1)))
			.toBe(loadExpectedOutput(1));
	});

	test('Scenario #2', () => {
		const
			parser = new Parser();

		expect(parser.getOutputForSourceFile(getPathToScenarioFile(2)))
			.toBe(loadExpectedOutput(2));
	});

	test('Scenario #3 - detect duplicate namespace imports', () => {
		const
			parser = new Parser();

		expect(parser.getOutputForSourceFile(getPathToScenarioFile(3)))
			.toBe(loadExpectedOutput(3));
	});

});
