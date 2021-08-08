import { TodosAccess } from './todosAcess'
//import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
//import * as createError from 'http-errors'

// TODO: Implement businessLogic

const logger = createLogger('todos')
const todoAccess = new TodosAccess()


export async function createTodo(createTodoRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {

    const itemId = uuid.v4()
    logger.info("create todo");
    return await todoAccess.createTodo({
      userId: userId,
      todoId: itemId,
      createdAt: new Date().toISOString(),
      name: createTodoRequest.name,
      dueDate: createTodoRequest.dueDate,
      done: false
    })


  }

  export async function deleteTodo(todoId: string, userId: string): Promise<void> {

    return await todoAccess.deleteTodo(todoId,userId)

  }


  export async function getTodos(userId: string): Promise<TodoItem[]> {
    return todoAccess.getTodos(userId)
  }

  export async function generateUrl(todoId: string, userId: string): Promise<string> {
    const url = await todoAccess.generateUrl(todoId,userId)
    
    return url
  }
  
  export async function updateTodo(todoId: string, userId: string,updatedTodo:UpdateTodoRequest): Promise<void> {

    return await todoAccess.updateTodos(todoId,userId,updatedTodo)

  }
