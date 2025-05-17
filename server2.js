const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'pages'))); // Servir archivos estáticos

// Conexión a MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'smns'
});

db.connect(err => {
  if (err) throw err;
  console.log('Conectado a la base de datos');
});

// Ruta para registrar usuario
app.post('/register', async (req, res) => {
  const { login, password, id_cliente, id_rol } = req.body;

  if (!login || !password || !id_cliente || !id_rol) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  const hashedPassword = await bcrypt.hash(password, 5);

  const sql = 'INSERT INTO usuarios (login, Contraseña, id_cliente, id_rol) VALUES (?, ?, ?, ?)';
  db.query(sql, [login, hashedPassword, id_cliente, id_rol], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'El usuario ya existe' });
      }
      return res.status(500).json({ message: 'Error en la base de datos' });
    }
    res.json({ message: 'Usuario registrado correctamente' });
  });
});

// Ruta principal que sirve el formulario
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'registro.html'));
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
