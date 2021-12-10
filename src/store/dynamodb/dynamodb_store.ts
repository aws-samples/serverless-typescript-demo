// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Product } from "../../model/Product";
import { ProductStore } from "../product-store";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandOutput,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { captureAWSv3Client } from "aws-xray-sdk-core";

export class DynamoDbStore implements ProductStore {
  private static tableName = process.env.TABLE_NAME;
  private static ddbClient: DynamoDBClient = captureAWSv3Client(new DynamoDBClient({}));
  //private static ddbClient: DynamoDBClient = new DynamoDBClient({});
  private static ddbDocClient: DynamoDBDocumentClient =
    DynamoDBDocumentClient.from(DynamoDbStore.ddbClient);

  public getProduct = async (id: string): Promise<Product | undefined> => {
    const params: GetCommand = new GetCommand({
      TableName: DynamoDbStore.tableName,
      Key: {
        id: id,
      },
    });
    const restult:GetCommandOutput = await DynamoDbStore.ddbDocClient.send(params);
    return restult.Item as Product;
  };

  public putProduct = async (product: Product): Promise<void> => {
    const params: PutCommand = new PutCommand({
      TableName: DynamoDbStore.tableName,
      Item: {
        id: product.id,
        name: product.name,
        price: product.price,
      },
    });
    await DynamoDbStore.ddbDocClient.send(params);
  };

  public deleteProduct = async (id: string): Promise<void> => {
    const params: DeleteCommand = new DeleteCommand({
      TableName: DynamoDbStore.tableName,
      Key: {
        id: id,
      },
    });
    await DynamoDbStore.ddbDocClient.send(params);
  };

  public getProducts = async (): Promise<Product[] | undefined> => {
    const params:ScanCommand = new ScanCommand( {
        TableName: DynamoDbStore.tableName,
        Limit: 20
    });
    const result = await DynamoDbStore.ddbDocClient.send(params);
    return result.Items as Product[];
  };
}
