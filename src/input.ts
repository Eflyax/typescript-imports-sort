import * as vscode from 'vscode';
import {options, aaa, ZOptions, AOptions} from './core/options/index';
import {sortZ, sortInsideEditor, sortOnSave} from './core/sort/index';
import vue from 'vue';
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

/**
 * 1) node.namedImports + alphabet		=> import { options } from './core/options/index';
 * 2) node.default + alphabet 				=> import vue from 'vue';
 * 3) node.namedImports === null			=> import * as vscode from 'vscode';
 * 4) node.hasTypeKeyword === true		=> import type {IFoo, IBar} from '@/types';
 */
