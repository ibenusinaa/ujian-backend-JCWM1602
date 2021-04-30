const express = require('express')
const cors = require('cors')
const bodyparser = require('body-parser')
const allRouter = require('./router/allRouter')

// main app
const app = express()

// apply middleware
app.use(cors())
app.use(express.json())

// main route
const response = (req, res) => res.status(200).send('<h1>REST API JCWM1602</h1>')
app.get('/', response)

app.use('/', allRouter)

// bind to local machine
const PORT = process.env.PORT || 2000
app.listen(PORT, () => console.log(`CONNECTED : port ${PORT}`))