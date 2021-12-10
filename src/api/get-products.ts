// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Product } from "../model/Product";
import { DynamoDbStore } from "../store/dynamodb/dynamodb_store";
import { ProductStore } from "../store/product-store";

const store: ProductStore = new DynamoDbStore();
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const result = await store.getProducts();
    console.info(result);

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: `{"products":${JSON.stringify(result)}}`,
    };
  } catch (error) {
      console.error(error);
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(error),
    };
  }
};
