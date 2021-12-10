## Serverless Typescript Demo



<p align="center">
  <img src="imgs/diagram.png" alt="Architecture diagram"/>
</p>

This is a simple serverless application built in Typescript and uses Node.js 14 runtime. It consists of an 
[Amazon API Gateway](https://aws.amazon.com/api-gateway/) backed by four [AWS Lambda](https://aws.amazon.com/lambda/) 
functions and an [Amazon DynamoDB](https://aws.amazon.com/dynamodb/) table for storage. 

## Requirements

- [AWS CLI](https://aws.amazon.com/cli/)
- [AWS CDK](https://aws.amazon.com/cdk/)
- [Node.js 14](https://nodejs.org/)
- [Artillery](https://www.artillery.io/) for load-testing the application

## Software

Within folder is the products npm project. This project contains all the code for all four Lambda 
functions. It uses the hexagonal architecture pattern to decouple the entry points, from the main domain logic and the 
storage logic.


### Deployment

Deploy the demo to your AWS account using [AWS CDK](https://aws.amazon.com/cdk/).

```bash
cdk deploy
```

The command `cdk deploy` will first build the products maven project using a docker build image with all the required GraalVM tools.
Then it will use AWS CloudFormation to deploy the resources to your account.

CDK will create an output of the API Gateway endpoint URL for future use in our load tests.

## Load Test

[Artillery](https://www.artillery.io/) is used to make 300 requests / second for 10 minutes to our API endpoints. You can run this
with the following command.

```bash
cd load-test
./run-load-test.sh
```

This is a demanding load test, to change the rate alter the `arrivalRate` value in `load-test.yml`.

### CloudWatch Logs Insights

Using this CloudWatch Logs Insights query you can analyse the latency of the requests made to the Lambda functions.

The query separates cold starts from other requests and then gives you p50, p90 and p99 percentiles.

```
filter @type="REPORT"
| fields greatest(@initDuration, 0) + @duration as duration, ispresent(@initDuration) as coldStart
| stats count(*) as count, pct(duration, 50) as p50, pct(duration, 90) as p90, pct(duration, 99) as p99, max(duration) as max by coldStart
```

## 👀 With other languages

You can find implementations of this project in other languages here:

* [🦀  Rust](https://github.com/aws-samples/serverless-rust-demo)
* [☕ Java with GraalVM](https://github.com/aws-samples/serverless-graalvm-demo)

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.

