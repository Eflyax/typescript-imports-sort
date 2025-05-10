import {AuthenticationService} from '@/services/AuthenticationService';
import {AuthorizationService} from '@/services/Authorization/AuthorizationService';
import {EActions, EEnvironments, EResources, ERouteConfigurations} from '@/types';
import {env} from '@/env';
import {
	fastifyZodOpenApiPlugin,
	fastifyZodOpenApiTransform,
	fastifyZodOpenApiTransformObject,
	serializerCompiler,
	validatorCompiler
} from 'fastify-zod-openapi';
import {fileURLToPath} from 'url';
import {logger as loggerPlugin} from './plugins/logger';
import {mikroOrm} from './plugins/mikroOrm';
import {name, version} from '../package.json';
import {onRequestHook} from './hooks/onRequest';
import {pluginFastifyUnderPressure} from './plugins/underPressure';
import {routes} from './routes';
import {TranslationProvider} from '@/lib/core-utils';
import {useError} from '@/composables/useError';
import cors from '@fastify/cors';
import csCz from './i18n/cs_CZ.xliff?raw';
import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifySwagger from '@fastify/swagger';
import i18n from 'fastify-i18n';
import path from 'path';
import swaggerUi from '@fastify/swagger-ui';
import * as fastifyLog from 'fastify-log';
import type {EntityManager} from '@mikro-orm/core';
import type {FastifyInstance, FastifyRequest} from 'fastify';
import type {FastifyZodOpenApiTypeProvider} from 'fastify-zod-openapi';
import 'zod-openapi/extend';

export async function createServer(): Promise<FastifyInstance> {
	return {};
}
