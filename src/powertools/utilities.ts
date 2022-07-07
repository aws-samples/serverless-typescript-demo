import { Logger } from '@aws-lambda-powertools/logger';
import { Metrics } from '@aws-lambda-powertools/metrics';
import { Tracer } from '@aws-lambda-powertools/tracer';

const logger = new Logger({
    persistentLogAttributes: {
        awsAccountId: process.env.AWS_ACCOUNT_ID || 'N/A',
        awsRegion: process.env.AWS_REGION
    }
});

const metrics = new Metrics({
    defaultDimensions: {
        awsAccountId: process.env.AWS_ACCOUNT_ID || 'N/A',
        awsRegion: process.env.AWS_REGION || 'N/A'
    }
});

const tracer = new Tracer();

export {
    logger,
    metrics,
    tracer
};