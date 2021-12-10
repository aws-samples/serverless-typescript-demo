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
  const id = event.pathParameters!.id;
  if (id === undefined) {
    console.warn("Missing 'id' parameter in path");
    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Missing 'id' parameter in path" }),
    };
  }
  try {
    console.info(`Fetching product ${id}`)
    const result = await store.getProduct(id);
    if (!result) {
      console.warn(`No product with id: ${id}`);
      return {
        statusCode: 404,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "Product not found" }),
      };
    }

    console.info(result);

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(result),
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
