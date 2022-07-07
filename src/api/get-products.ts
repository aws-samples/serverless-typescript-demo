// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { APIGatewayProxyResult } from "aws-lambda";
import { DynamoDbStore } from "../store/dynamodb/dynamodb-store";
import { ProductStore } from "../store/product-store";
import { logger, tracer, metrics } from "../powertools/utilities"
import middy from "@middy/core";
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer';
import { injectLambdaContext } from '@aws-lambda-powertools/logger';
import { MetricUnits } from '@aws-lambda-powertools/metrics';

const store: ProductStore = new DynamoDbStore();
const lambdaHandler = async (): Promise<APIGatewayProxyResult> => {
  try {
    const result = await store.getProducts();
    logger.info('[GET products] Products retrieved', { details: { products: result } });
    metrics.addMetric('ProductsRetrieved', MetricUnits.Count, 1);

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: `{"products":${JSON.stringify(result)}}`,
    };
  } catch (error) {
      logger.info('[GET products] Error occurred while retrieving the products', error);
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(error),
    };
  }
};

const handler = middy(lambdaHandler)
    .use(captureLambdaHandler(tracer))
    .use(injectLambdaContext(logger, { clearState: true }));

export {
  handler
};