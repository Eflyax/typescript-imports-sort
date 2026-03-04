export enum Sex {
	W = 'woman',
	M = 'man'
 }

import * as vscode from 'vscode';
import {options, aaa, ZOptions, AOptions} from './core/options/index';
import {sortZ, sortInsideEditor, sortOnSave} from './core/sort/index';
import vue from 'vue';
import react from 'react';
import * as AbstractClass from 'abstract';
import {isSupportedLanguage as supLang} from './core/util/index';
import type IRequest from '@/node-types';
import type {IFoo, IBar} from '@/types';
import {
	NInput,
	NCheckbox,
	NForm,
	NButton,
	NFormItem
} from 'naive-ui';

import './some.scss';

const
	MAX = 100,
	MIN = 0;

export class Scenario1 {
	// some code
}
