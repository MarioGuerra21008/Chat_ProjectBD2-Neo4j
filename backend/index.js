// index.js

const express = require('express');
const app = express();
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const neo4j = require('neo4j-driver');
const path = require('path');
const cors = require('cors');

dotenv.config();

const corsOptions = {
  origin: 'http://localhost:3000', // El dominio del frontend
  optionsSuccessStatus: 200 // Algunos navegadores requieren este código de estado para permitir las solicitudes CORS
};

app.use(cors(corsOptions));

// Middleware para analizar el cuerpo de las solicitudes en formato JSON
app.use(express.json());


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

//Instancia de Mario
const uri = 'neo4j+s://c5df7f5d.databases.neo4j.io';
const user = 'neo4j';
const password = 'wafiofqDUSBfxe2Muw1kB9OBtW5O7mDoy3YSzPYLSuU';
const neo4jDriver = neo4j.driver(uri, neo4j.auth.basic(user, password));

// Conexión a Neo4j
//const uri = 'neo4j+s://32aa479e.databases.neo4j.io';
//const user = 'neo4j';
//const password = 'kVlo04Ku2n2fZoLXh-fRMdzB8x5Jb9WhnAneDQh7Lss';
//const neo4jDriver = neo4j.driver(uri, neo4j.auth.basic(user, password));

// Middleware para adjuntar el driver de Neo4j a la solicitud
app.use((req, res, next) => {
  req.neo4jDriver = neo4jDriver;
  next();
});


const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploded successfully");
  } catch (error) {
    console.error(error);
  }
});

// Rutas
require('./routes/auth')(app); // Importa y llama la función pasando 'app' como argumento
require('./routes/posts')(app);
require('./routes/users')(app);
require('./routes/conversations')(app);
require('./routes/messages')(app);

// Configuración del servidor
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Otras configuraciones y rutas...

app.listen(8800, () => {
  console.log('Backend server is running!');
});
