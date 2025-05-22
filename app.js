const express = require('express'); // Corrección en 'require'
const app = express();


app.use(express.urlencoded({ extended: false })); // Corrección en 'express.urlencoded'
app.use(express.json());

const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'})

app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname+'/public'))

//motor de plantillas 
app.set('view engine', 'ejs');

// invocamos bcrypt
const bcryptjs= require('bcryptjs')

//variables de seccion
const session= require('express-session')
app.use(session({
    secret:'secret',
    resave: true,
    saveUninitialized:true
}));



app.get('/', (req, res) => { // Corrección en 'app.get'
    res.send('Hola');
});

app.listen(3000, () => { // Se elimina (req, res) en app.listen
    console.log('Servidor corriendo en puerto 3000');
});
