const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connection = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/login', (req, res) => {
    const { login, contraseña } = req.body;

    if (!login || !contraseña) {
        return res.status(400).json({ message: 'Campos incompletos' });
    }

    const query = 'SELECT * FROM usuarios WHERE login = ? AND contraseña = ?';
    connection.query(query, [login, contraseña], (err, results) => {
        if (err) {
            console.error('❌ Error en consulta:', err);
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
