import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {


  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todoIdIndex = process.env.TODOS_CREATED_AT_INDEX,
    private readonly todoTable = process.env.TODOS_TABLE,
    private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
    private readonly url_expiration = process.env.SIGNED_URL_EXPIRATION) {}


async createTodo(todo: TodoItem): Promise<TodoItem> {
  logger.info('create todo')
    await this.docClient.put({
      TableName: this.todoTable,
      Item: todo
    }).promise()

    return todo
  }

  async deleteTodo(todoId: string, userId: string): Promise<void> {
    logger.info('Delete todo')
    const params = {
      TableName: this.todoTable,
      Key: {
        todoId: todoId,
        userId: userId
      },
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ConditionExpression: 'userId = :userId'
    }

    await this.docClient.delete(params).promise()

    return 
  }

  async getTodos(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all todos')

    var params = {
      TableName: this.todoTable,
      IndexName: this.todoIdIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }
    const result = await this.docClient.query(params).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async generateUrl(todoId: string, userId: string): Promise<string>{
    const s3 = new AWS.S3({
      signatureVersion: 'v4'
    })


    const url = await  s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: parseInt(this.url_expiration)
    })

    await this.docClient.update({
      TableName: this.todoTable, 
      Key: {
       todoId: todoId, 
       userId: userId
      }, 
      UpdateExpression: "set attachmentUrl = :attachmentUrl",
      ExpressionAttributeValues: {
       ":attachmentUrl": `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
     }
    }).promise()
    console.log(`url: ${url}`);
    return url as string;
  }





async  updateTodos(todoId: string, userId: string, updatedTodo: TodoUpdate) {
  
  await this.docClient.update({
   TableName: this.todoTable, 
   Key: {
    todoId: todoId, 
    userId: userId
   }, 
   UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done', 
   ExpressionAttributeValues: {
     ':name': updatedTodo.name,
     ':dueDate': updatedTodo.dueDate,
     ':done': updatedTodo.done
   },
   ExpressionAttributeNames: {
     "#name": "name"
   }
 }).promise()
}








}






function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log("Creating a local DynamoDB instance");
  return new XAWS.DynamoDB.DocumentClient({
      region: "localhost",
      endpoint: "http://localhost:8000"
  });
}
return new XAWS.DynamoDB.DocumentClient();
}
