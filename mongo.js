const mongoose = require('mongoose')

const password = process.argv[2]
const url =
  `mongodb+srv://yaofeiWang:${password}@cluster0.jmrjd.mongodb.net/phoneBook?retryWrites=true&w=majority`

mongoose.connect(url)

const phonebookSchema = new mongoose.Schema({
    name: String,
    number: String
})
const Phonenumber = mongoose.model('Phonenumber', phonebookSchema)

if (process.argv.length < 3 || process.argv.length > 5) {
    console.log('Please provide password and data to be saved to mongodb')
    process.exit(1)
} else if (process.argv.length == 3) {
    Phonenumber.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(phonenumber => {
        console.log(phonenumber.name, phonenumber.number)
    })
    mongoose.connection.close()
    })
} else if (process.argv.length == 5) {
    const name = process.argv[3]
    const number = process.argv[4]
    
    const phonenumber = new Phonenumber({
      name: name,
      number: number
    })
    
    phonenumber.save().then(result => {
      console.log('added ', phonenumber.name, 'number', phonenumber.number, 'to phonebook')
      mongoose.connection.close()
    })
}

