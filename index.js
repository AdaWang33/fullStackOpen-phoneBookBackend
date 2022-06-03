require('dotenv').config()
const { request, response } = require('express')
const express = require('express')
const morgan = require('morgan')

const app = express()
app.use(express.json())

const cors = require('cors')

app.use(cors())

app.use(express.static('build'))

morgan.token('reqbody', (req, res) =>
  JSON.stringify(req.body)
)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :reqbody'))

const Phonenumber = require('./models/person')
const person = require('./models/person')
let persons = [
    // { 
    //   "id": 1,
    //   "name": "Arto Hellas", 
    //   "number": "040-123456"
    // },
    // { 
    //   "id": 2,
    //   "name": "Ada Lovelace", 
    //   "number": "39-44-5323523"
    // },
    // { 
    //   "id": 3,
    //   "name": "Dan Abramov", 
    //   "number": "12-43-234345"
    // },
    // { 
    //   "id": 4,
    //   "name": "Mary Poppendieck", 
    //   "number": "39-23-6423122"
    // }
]

app.get('/', (request, response)=>{
    response.send('<h1>Server Side Page</h1>')
})

app.get('/api/persons', (request, response)=>{
    Phonenumber.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/api/info', (request, response)=>{
    let data = new Date();
    let personNums = 0;
    Phonenumber.find({}).then(persons => {
        personNums = persons.length;
    }).then(()=>
    response.send(
        `
        <p>Phonebook has info for ${personNums} people</p>
        <p>${data}</p>
        `
    )
    )
})

app.get('/api/persons/:id', (request, response) => {
    Phonenumber.findById(String(request.params.id))
    .then(phoneNumber => {
        if (phoneNumber) {
            response.json(phoneNumber)
          } else {
            response.status(404).end()
          }
    })
    .catch(error => {
        console.log(error)
        response.status(500).end()
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
    Phonenumber.findByIdAndRemove(request.params.id)
      .then(result => {
        // status code should be returned to a DELETE request: 204 (no content) or 404
        response.status(204).end()
      })
      .catch(error => next(error))
  })

app.post('/api/persons', (request, response) => {
    const body = request.body
    if (!body) {
        response.status(400).send({
            error: 'content is missing!'
        })
    } else if (!body.name || body.name===null || body.name==='') {
        response.status(400).send({
            error: 'name is missing!'
        })
    } else if (!body.number || body.number===null || body.number==='') {
        response.status(400).send({
            error: 'number is missing!'
        })
    } else if (persons.filter(person => person.name === body.name).length!==0){
        response.status(409).send({ // conflict error code
            error: 'name must be unique'
        })
    }
    else {
        const newPhonenumber = new Phonenumber ({
            name: body.name,
            number: body.number,
            id: Math.floor(Math.random() * 10000)
        })
        newPhonenumber.save().then(savedPhonenumber => {
            response.json(savedPhonenumber)
        })
    }
})

app.put('/api/persons/:id', (request, response, next) => {
    Phonenumber.findByIdAndUpdate(request.params.id, {number: request.body.number})
      .then(result => {
        // Phonenumber.find({}).then(persons => {
        //     response.json(persons)
        // })
        response.json(result)
      })
      .catch(error => next(error))
})

// There are also situations where we want to define middleware functions after routes
// means that we are defining middleware functions that are only called if no route handles the HTTP request
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } 
  
    next(error)
}
  
  // this has to be the last loaded middleware.
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})