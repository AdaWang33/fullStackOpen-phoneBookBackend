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

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (request, response)=>{
    response.send('<h1>Server Side Page</h1>')
})

app.get('/api/persons', (request, response)=>{
    response.json(persons)
})

app.get('/api/info', (request, response)=>{
    let data = new Date();
    response.send(
        `
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${data}</p>
        `
    )
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const note = persons.find(person => person.id === id)

    if (note) {
        response.json(note)
    } else {
        return response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
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
        const newPerson = {
            name: body.name,
            number: body.number,
            id: Math.floor(Math.random() * 10000)
        }
        persons = persons.concat(newPerson)
        response.json(newPerson)
    }
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})