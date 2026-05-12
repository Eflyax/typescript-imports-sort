import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {minimatch} from 'minimatch';

const ZED_SETTINGS_PATH = path.join(os.homedir(), '.config', 'zed', 'settings.json');

function stripJsoncComments(text: string): string {
    return text
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/[^\n]*/g, '');
}

function readExclusions(settingsContent?: string): Array<string> {
    let raw: string;
    if (settingsContent !== undefined) {
        raw = settingsContent;
    } else {
        try {
            raw = fs.readFileSync(ZED_SETTINGS_PATH, 'utf-8');
        } catch {
            return [];
        }
    }

    try {
        const parsed = JSON.parse(stripJsoncComments(raw));
        const exclusions = parsed?.file_scan_exclusions;
        return Array.isArray(exclusions) ? exclusions : [];
    } catch {
        return [];
    }
}

function matchesPattern(filePath: string, pattern: string): boolean {
    const opts = {dot: true, matchBase: true};
    if (minimatch(filePath, pattern, opts)) return true;
    if (pattern.endsWith('/*') && !pattern.endsWith('/**')) {
        return minimatch(filePath, pattern.slice(0, -1) + '**', opts);
    }
    return false;
}

export function isExcluded(filePath: string, settingsContent?: string): boolean {
    const patterns = readExclusions(settingsContent);
    return patterns.some(pattern => matchesPattern(filePath, pattern));
}
