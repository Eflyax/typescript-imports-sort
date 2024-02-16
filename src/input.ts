import * as vscode from 'vscode';
import { options } from './core/options/index';
import { sortInsideEditor, sortOnSave } from './core/sort/index';
import vue from 'vue';
import { isSupportedLanguage as supLang } from './core/util/index';
import type {IFoo, IBar} from '@/types';
import type IRequest from '@/node-types';
import {
	NButton,
	NCheckbox,
	NForm,
	NFormItem,
	NInput
} from 'naive-ui';
/**
 * 1) node.namedImports + alphabet		=> import { options } from './core/options/index';
 * 2) node.default + alphabet 				=> import vue from 'vue';
 * 3) node.namedImports === null			=> import * as vscode from 'vscode';
 * 4) node.hasTypeKeyword === true		=> import type {IFoo, IBar} from '@/types';
 */
