const express = require('express')
const cors = require('cors')

const { v4: uuidv4 } = require('uuid')

const app = express()

app.use(cors())
app.use(express.json())

const users = []

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const userExist = users.find(user => user.username === username)

  if (!userExist) {
    return response.status(400).json({ error: 'User does not exists' })
  }

  request.user = userExist
  
  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userExist = users.some(user => user.username === username)
  if (userExist) {
    return response.status(400).json({ error: 'Username already exists' })
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  }

  users.push(newUser)

  return response.status(201).json(newUser)
})

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers

  const user = users.find(user => user.username === username).todos

  return response.status(200).json(user)
})

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request

  const newTodo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date(),
  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo)
})

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { id } = request.params
  const { user } = request

  const searchTodo = user.todos.find(todo => todo.id === id)
  if (!searchTodo) {
    return response.status(404).json({ error: 'Todo not found' })
  }

  Object.assign(searchTodo, { title, deadline: new Date(deadline) })

  user.todos.map(todo => todo.id === id && searchTodo)

  return response.status(200).json(searchTodo)
})

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const searchTodo = user.todos.find(todo => todo.id === id)
  if (!searchTodo) {
    return response.status(404).json({ error: 'Todo not found' })
  }

  Object.assign(searchTodo, { done: true })
  user.todos.map(todo => todo.id === id && (
    searchTodo
  ))

  return response.status(200).json(searchTodo)
})

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const searchTodo = user.todos.find(todo => todo.id === id)
  if (!searchTodo) {
    return response.status(404).json({ error: 'Todo not found' })
  }

  user.todos = user.todos.filter(todo => todo.id !== id)

  return response.status(204).send()
})

module.exports = app