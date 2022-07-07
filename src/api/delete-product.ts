// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDbStore } from "../store/dynamodb/dynamodb-store";
import { ProductStore } from "../store/product-store";
import middy from "@middy/core";
import {captureLambdaHandler} from "@aws-lambda-powertools/tracer";
import {logger, metrics, tracer} from "../powertools/utilities";
import { injectLambdaContext } from "@aws-lambda-powertools/logger";
import {logMetrics, MetricUnits} from "@aws-lambda-powertools/metrics";

const store: ProductStore = new DynamoDbStore();
const lambdaHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters!.id;
  if (id === undefined) {
    logger.warn('[GET product] Missing \'id\' parameter in path');
    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Missing 'id' parameter in path" }),
    };
  }
  try {
    logger.info('[GET product] Fetching product with ID '+ id);
    const result = await store.getProduct(id);
    if (!result) {
      logger.warn('[GET product] No product found with ID '+ id);
      return {
        statusCode: 404,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "Product not found" }),
      };
    }

    logger.info('[GET product] Product found with ID '+ id, { details: { result } });

    metrics.addMetric('productRetrieved', MetricUnits.Count, 1);
    metrics.addMetadata('productId', id);

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(result),
    };
  } catch (error) {
    logger.error('[GET product] Unexpected error occurred', error);
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(error),
    };
  }
};

const handler = middy(lambdaHandler)
    .use(captureLambdaHandler(tracer))
    .use(logMetrics(metrics))
    .use(injectLambdaContext(logger, { clearState: true, logEvent: true }));

export {
  handler
};