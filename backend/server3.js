    const express = require('express');
    const cors = require('cors');
    const bodyParser = require('body-parser');
    const connection = require('./db');

    const app = express();
    app.use(cors());
    app.use(bodyParser.json());

    app.post('/login', (req, res) => {
        const { email, password } = req.body;
        console.log(' Intento de login con:', email, password);

        const query = 'SELECT * FROM usuarios WHERE login = ? AND contraseña = ?';
        connection.query(query, [email, password], (err, results) => {
            if (err) {
                console.error('Error en consulta SQL:', err);
                return res.status(500).json({ message: 'Error en el servidor' });
            }

            if (results.length > 0) {
                console.log('Usuario autenticado');
                return res.status(200).json({ message: 'Login exitoso' });
            } else {
                console.log('Credenciales incorrectas');
                return res.status(401).json({ message: 'Credenciales incorrectas' });
                res.json({ mensaje: "Login exitoso", usuario: user.username });

            }
        });
    });
  
    app.listen(3000, () => {
        console.log('Servidor corriendo en http://localhost:3000');
    });
