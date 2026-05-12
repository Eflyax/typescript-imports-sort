import {isExcluded} from './formatters/exclusionFilter';
import * as readline from 'readline';

const rl = readline.createInterface({input: process.stdin});
rl.on('line', line => {
    if (line && !isExcluded(line)) process.stdout.write(line + '\n');
});
