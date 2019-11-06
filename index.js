const crypto = require('crypto')
const Constants = require('constants')
const fs = require('fs')
const path = require('path')
const express = require('express')
const multer = require('multer')
const axios = require('axios').default

const app = express()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve('./uploads'))
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})
const uploadFile = multer({ storage: storage })

// setup rendering engine
app.set('views', path.resolve('./views'))
app.set('view engine', 'pug')

// setup body parse
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// setup public folder for js and css
app.use(express.static(path.resolve('./public')))

app.get('/ping', (_, res) => res.send({ pong: 1 }))

app.get('/', (_, res) => res.render('index'))

const http = require('http').Server(app)
const io = require('socket.io')(http)

let frontendSocket = null
let rektor = null
let dekan = null
let mahasiswa = null

io.on('connection', socket => {
  console.log('Frontend/Reader has connected')

  // Dekan 00 00
  socket.on('ACS ACR1281 1S Dual Reader 00 00 inserted', (data) => {
    console.log('Dekan has connected')
    console.log('Dekan Data: ', data)
    
    dekan = socket

    frontendSocket.emit('ACS ACR1281 1S Dual Reader 00 00 inserted', data)
  })

  socket.on('ACS ACR1281 1S Dual Reader 00 00 removed', _ => {
    dekan = null
    frontendSocket.emit('ACS ACR1281 1S Dual Reader 00 00 removed')
  })

  // Mahasiswa 01 00
  socket.on('ACS ACR1281 1S Dual Reader 01 00 inserted', (data) => {
    console.log('Mahasiswa has connected')
    console.log('Mahasiswa Data: ', data)
    
    mahasiswa = socket

    frontendSocket.emit('ACS ACR1281 1S Dual Reader 01 00 inserted', data)
  })

  socket.on('ACS ACR1281 1S Dual Reader 01 00 removed', _ => {
    mahasiswa = null
    frontendSocket.emit('ACS ACR1281 1S Dual Reader 01 00 removed')
  })

  // Rektor 02 00
  socket.on('ACS ACR1281 1S Dual Reader 02 00 inserted', (data) => {
    console.log('Rektor has connected')
    console.log('Rektor Data: ', data)
    
    rektor = socket

    frontendSocket.emit('ACS ACR1281 1S Dual Reader 02 00 inserted', data)
  })

  socket.on('ACS ACR1281 1S Dual Reader 02 00 removed', _ => {
    rektor = null
    frontendSocket.emit('ACS ACR1281 1S Dual Reader 02 00 removed')
  })

  socket.on('frontend connect', _ => {
    console.log('Frontend has connected')

    frontendSocket = socket
  })

  socket.on('disconnect', _ => console.log('Reader disconnected'))
})

function checksumFile(algorithm, path) {
  return new Promise((resolve, reject) =>
    fs.createReadStream(path)
      .on('error', reject)
      .pipe(crypto.createHash(algorithm)
        .setEncoding('hex'))
      .once('finish', function () {
        resolve(this.read())
      })
  )
}

app.post('/submit-sign', uploadFile.single('fileToSign'), async (req, res) => {
  if (!dekan || !mahasiswa || !rektor) {
    return res.render('index', { error: 'kartu tidak tertancap semua' })
  }
  // get uploaded file
  const multerFile = req.file
  console.log(multerFile)

  // hash the file
  const fileHashMD5 = await checksumFile('md5', multerFile.path)

  console.log('hash: ', fileHashMD5)

  // get private key
  const key = require('./key')
  const jundi = key.jundi.private
  const mirna = key.mirna.private
  const anis = key.anis.private

  // encrypt with private key
  const encryptByAnis = crypto.privateEncrypt(anis, Buffer.from(fileHashMD5))
  console.log('encryptByAnis: ', encryptByAnis)

  const encryptByMirna = crypto.privateEncrypt({ key: mirna, padding: Constants.RSA_NO_PADDING }, Buffer.from(encryptByAnis))
  console.log('encryptByMirna: ', encryptByMirna)

  const encryptByJundi = crypto.privateEncrypt({ key: jundi, padding: Constants.RSA_NO_PADDING }, Buffer.from(encryptByMirna))
  console.log('encryptByJundi: ', encryptByJundi)
  

  // send to server digital-assets
  const uploadedFile = fs.readFileSync(path.resolve(multerFile.path))
  const result = await axios.put('https://digital-assets.infralabs.cs.ui.ac.id/index.php', uploadedFile, {
    headers: {
      'x-hash': fileHashMD5,
      'x-signed-hash': encryptByJundi.toString('base64'),
      'x-url-signer-1': 'https://ca.infralabs.ui.ac.id/repository/80a47ea4d52c75de', // 80a47ea4d52c75de
      'x-url-signer-2': 'https://ca.infralabs.ui.ac.id/repository/80a47ea4d52c75dd', // 80a47ea4d52c75dd
      'x-url-signer-3': 'https://ca.infralabs.ui.ac.id/repository/80a47ea4d52c75dc', // 80a47ea4d52c75dc
      'content-type': 'application/octet-stream'
    }
  })

  console.log(result.data)

  return res.render('index', { result: result.data })
})

app.use((_, res) => res.status(404).send({ reason: 'No route found' }))

http.listen(7777, _ => console.log('Ijazah Issuer running on 7777'))
