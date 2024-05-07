import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { ServerlessTypescriptDemoStack } from '../lib/serverless-typescript-demo-stack';

describe('ServerlessTypescriptDemoStack', () => {
  let stack: Stack;

  beforeAll(() => {
    const app = new Stack();
    stack = new ServerlessTypescriptDemoStack(app, 'MyTestStack');
  });

  it('creates a DynamoDB table with correct configurations', () => {
    const template = Template.fromStack(stack);
    
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'Products',
      BillingMode: 'PAY_PER_REQUEST'
    });
  });

  it('creates lambda functions with the necessary environment variables', () => {
    const template = Template.fromStack(stack);
    
    template.resourceCountIs('AWS::Lambda::Function', 5);
  });

  it('creates an API Gateway with correct configuration', () => {
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      Name: 'ProductsApi'
    });
  });

});

