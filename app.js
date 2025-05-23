const express = require('express'); 
const app = express();


app.use(express.urlencoded({ extended: false })); 
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

//conexion de bd

const connection = require('./db');

//estableciemineto de rutas 


    app.get('/loginC', (req, res) => {
        res.render('loginC');
    });

   app.get('/registro', (req, res) => {
        res.render('registro');
    });

//registro
 app.post('/registro', async (req, res) => {
        res.render('registro');
        const nombre = req.body.nombre;
        const contrasena = req.body.contrasena;


    });

app.listen(3000, () => { // Se elimina (req, res) en app.listen
    console.log('Servidor corriendo en puerto 3000');
});
