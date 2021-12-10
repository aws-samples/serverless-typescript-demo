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
  console.info(`Event body ${event.body}`);
  const id = event.pathParameters!.id;
  if (id === undefined) {
    console.warn("Missing 'id' parameter in path");
    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Missing 'id' parameter in path" }),
    };
  }
  if (!event.body) {
    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Empty request body" }),
    };
  }

  let product: Product;
  try {
    product = JSON.parse(event.body);
    console.log(`Parsed prduct ${product}`);
    if ((typeof product) !== "object" ){
      throw Error("Parsed product is not an object")
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message: "Failed to parse product from request body",
      }),
    };
  }

  if (id !== product.id) {
    console.error(
      `Product ID in path ${id} does not match product ID in body ${product.id}`
    );
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
    return {
      statusCode: 201,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Product created" }),
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
