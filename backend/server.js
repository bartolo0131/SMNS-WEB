const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connection = require('./db');

const app = express();
app.use(cors()); // Permitir peticiones desde el frontend
app.use(bodyParser.json());

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    connection.query(query, [email, password], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error en el servidor' });
        }
        if (results.length > 0) {
            return res.status(200).json({ message: 'Login exitoso' });
        } else {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }
    });
});

app.listen(3000, () => {
    console.log('🚀 Servidor corriendo en http://localhost:3000');
});
