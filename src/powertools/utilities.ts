import { Logger } from '@aws-lambda-powertools/logger';
import { Metrics } from '@aws-lambda-powertools/metrics';
import { Tracer } from '@aws-lambda-powertools/tracer';

const logger = new Logger();

const metrics = new Metrics();

const tracer = new Tracer();

export {
    logger,
    metrics,
    tracer
};