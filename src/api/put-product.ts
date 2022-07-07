// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Product } from "../model/product";
import { DynamoDbStore } from "../store/dynamodb/dynamodb-store";
import { ProductStore } from "../store/product-store";
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer';
import { injectLambdaContext } from '@aws-lambda-powertools/logger';
import {logMetrics, MetricUnits} from '@aws-lambda-powertools/metrics';
import middy from "@middy/core";
import {logger, metrics, tracer} from "../powertools/utilities";

const store: ProductStore = new DynamoDbStore();
const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {

  const id = event.pathParameters!.id;
  if (id === undefined) {
    logger.warn('[PUT products] Missing \'id\' parameter in path');
    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Missing 'id' parameter in path" }),
    };
  }
  if (!event.body) {
    logger.warn('[PUT products] Empty request body');
    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Empty request body" }),
    };
  }

  let product: Product;
  try {
    product = JSON.parse(event.body);

    if ((typeof product) !== "object" ){
      throw Error("Parsed product is not an object")
    }
  } catch (error) {
    logger.error('[PUT products] Unexpected error', error);
    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message: "Failed to parse product from request body",
      }),
    };
  }

  if (id !== product.id) {
    logger.error( `[PUT products] Product ID in path ${id} does not match product ID in body ${product.id}`);
    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message: "Product ID in path does not match product ID in body",
      }),
    };
  }

  try {
    await store.putProduct(product);

    metrics.addMetric('productCreated', MetricUnits.Count, 1);

    return {
      statusCode: 201,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Product created" }),
    };
  } catch (error) {
    logger.error('[PUT products] Unexpected error', error);
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