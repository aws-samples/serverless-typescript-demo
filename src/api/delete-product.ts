// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDbStore } from "../store/dynamodb/dynamodb-store";
import { ProductStore } from "../store/product-store";
import middy from "@middy/core";
import { captureLambdaHandler } from "@aws-lambda-powertools/tracer";
import {logger, metrics, tracer} from "../powertools/utilities";
import { injectLambdaContext } from "@aws-lambda-powertools/logger";
import {MetricUnits} from "@aws-lambda-powertools/metrics";

const store: ProductStore = new DynamoDbStore();
const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters!.id;
  if (id === undefined) {
    logger.warn('[DELETE products] Missing \'id\' parameter in path');
    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Missing 'id' parameter in path" }),
    };
  }
  try {
    await store.deleteProduct(id);
    metrics.addMetric('ProductDeleted', MetricUnits.Count, 1);

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Product deleted" }),
    };
  } catch (error) {
    logger.error('[DELETE products] Unexpected error occurred', error);
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