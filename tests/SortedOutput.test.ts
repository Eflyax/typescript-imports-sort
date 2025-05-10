import {configuration} from '../src/configuration';
import {describe, expect, test} from 'vitest';
import {Parser} from '../src/core/Parser';
import fs from 'fs';

const
	loadInput = (id: number, extension = 'ts'): string => {
		return fs.readFileSync(`${__dirname}/inputScenarios/scenario${id}.${extension}`, 'utf-8');
	},
	loadExpectedOutput = (id: number, extension = 'ts'): string => {
		return fs.readFileSync(`${__dirname}/outputScenarios/scenario${id}.${extension}`, 'utf-8');
	};

describe('Compare sorted output', () => {
	test('Scenario #1', () => {
		const
			parser = new Parser(configuration);

		expect(parser.getOutputForSource(loadInput(1)))
			.toBe(loadExpectedOutput(1));
	});

	test('Scenario #2', () => {
		const
			parser = new Parser(configuration);

		expect(parser.getOutputForSource(loadInput(2)))
			.toBe(loadExpectedOutput(2));
	});

	test('Scenario #3 - detect duplicate namespace imports', () => {
		const
			parser = new Parser(configuration);

		expect(parser.getOutputForSource(loadInput(3)))
			.toBe(loadExpectedOutput(3));
	});

	test('Scenario #4 - Vue SFC', () => {
		const
			parser = new Parser(configuration);

		expect(parser.getOutputForSource(loadInput(4, 'vue')))
			.toBe(loadExpectedOutput(4, 'vue'));
	});

	test('Scenario #5 - hashtag alias, symbol ":" in import path', () => {
		const
			parser = new Parser(configuration);

		expect(parser.getOutputForSource(loadInput(5)))
			.toBe(loadExpectedOutput(5));
	});

	test('Scenario #6 - ignore export', () => {
		const
			parser = new Parser(configuration);

		expect(parser.getOutputForSource(loadInput(6)))
			.toBe('');
	});

	test('Scenario #7 - multiline import', () => {
		const
			parser = new Parser(configuration);

		expect(parser.getOutputForSource(loadInput(7)))
			.toBe(loadExpectedOutput(7));
	});

	test('Scenario #8 - configuration', () => {
		const
			parser = new Parser({
				tabsIndentation: false,
				maximumLineLength: 1,
				quoteSymbol: `"`,
				spaceAroundBrackets: true,
				useSemicolon: false
			});

		expect(parser.getOutputForSource(loadInput(8)))
			.toBe(loadExpectedOutput(8));
	});

	test('Scenario #9 - sort types', () => {
		const
			parser = new Parser(configuration);

		expect(parser.getOutputForSource(loadInput(9)))
			.toBe(loadExpectedOutput(9));
	});
});
