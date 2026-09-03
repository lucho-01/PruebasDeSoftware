const express = require('express')
const app = express()

const PORT = process.env.PORT ?? 3000

app.use(express.json())

app.get('/', (req, res) => {
  res.status(200).send('holaaaa')
})

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password son obligatorios' })
  }
  res.json({ mensajeDePrueba: 'Recibí estos datos: ', email, password })
})

app.use((req, res) => {
  res.status(404).send('error 404')
})

app.listen(PORT, () => {
  console.log(`the server is listening on port http://localHost:${PORT}`)
})
