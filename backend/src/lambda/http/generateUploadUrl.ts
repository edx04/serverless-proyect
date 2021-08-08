import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
//import * as middy from 'middy'
//import { cors, httpErrorHandler } from 'middy/middlewares'

import { generateUrl } from '../../helpers/todos'
import { getUserId } from '../utils'

export const handler = 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const userId = getUserId(event)
    const url = await generateUrl(todoId,userId)
    

    return {
      statusCode: 200, 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      }, 
      body: JSON.stringify({
        uploadUrl:url
      })
    }
  }


