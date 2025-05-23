const express = require("express");
const mysql = require("mysql");
const app = express();
const path = require('path');
const session = require("express-session");
const bcryptjs = require('bcryptjs'); 
const { error, time } = require("console");
const { name } = require("ejs");

app.use(express.static(path.join(__dirname, 'public')));

let conexion = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'smns'

});


app.use(session({
  secret: 'secreto_seguro',
  resave: false,
  saveUninitialized: false
}));


app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.urlencoded({ extended: true }));

app.get("/contacto", function(req, res) {
    res.render("contacto");
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/perfil", function(req, res) {
    res.render("perfil");
});


//login 

app.post('/login', async (req, res) => {
  const login = req.body.login;
  const contrasena = req.body.password;

  if (login && contrasena) {
    conexion.query('SELECT * FROM usuarios WHERE login = ?', [login], async (error, results) => {
      if (error) {
        console.error('Error en la consulta:', error);
        return res.status(500).send('Error interno del servidor');
      }

      if (results.length === 0 || contrasena !== results[0].Contrasena) {

            res.render('login', {
              alert: false,
              alertTitle: 'Credenciales erradas',
              alertMessage: 'USUARIO O CONTRASEÑA INCORRECTOS',
              alertIcon: 'error',
              showconfirmButton: false,
              time: false,
              ruta: ''
            });

      } else {
        req.session.login =results [0].login
        res.render('perfil',{
          alert:true,
          alertTitle: "Conexion exitosa",
          alertMessage : "LOGIN CORRECTO",
          alertIcon :"success",
          showconfirmButton: false,
          time : 1500,
          ruta : ''

        });
      }
    });
  }  else {
    res.render('login', { mensaje: 'Por favor, llena todos los campos' });
  }
});


//direccionamiento




app.get('/', (req, res) => {
    if (req.session.loggedin) {
        res.render('registro', {
            login: true,
            name: req.session.name
        });
    } else {
        res.render('registro', {
            login: false,
            name: 'Debe iniciar sesión'
        });
    }
});



app.post("/contactar", function(req, res) {
 const { nombre,apellido,correo,telefono,paisorigen,tipocaso,comentario } = req.body;

    let ingresar = "INSERT INTO contacts (nombre,apellido,email,telefono,paisorigen,tipocaso,comentario) VALUES (?,?,?,?,?,?,?)";
    
    conexion.query(ingresar, [nombre, apellido,correo,telefono,paisorigen,tipocaso,comentario],function(error) {
        if (error) {
            console.error("Error al insertar datos:", error);
            res.status(500).send("Error en el servidor");
        } else {
            console.log("Datos cargados correctamente");
            res.render("contacto", { mensaje: "We're ready to contact you as soon as possible. One of our attorneys will contact you to guide you through your process.", tipoMensaje: "exito" });
        }
    });
});



app.get("/registro", function(req, res)  {
    res.render("registro")
});

app.get("/contacto", function(req, res) {
    res.render("contacto");
});

// ingreso de usuarios nuevos

app.post("/validar",function(req, res) {
const datos =  req.body;
    let nombre= datos.nombre;
    let apellido= datos.apellido;
    let genero= datos.genero;
    let tip_identificacion= datos.identificacion;
    let telefono = datos.Telefono;
    let documento = datos.documento;
    let correo = datos.email;
    let fechanacimiento = datos.fechanacimiento;
   
    

    let buscar = "select * from persona WHERE documento = '"+documento+"'"
        conexion.query(buscar,function(error,row){
        if(error){
            throw error;
        }else{
            if(row.length >0){
            console.log("usuario ya exite ");
            res.render("registro", { mensaje: "The user is already registered",tipoMensaje: 'error'  });
            }else {

              let registrar = "INSERT INTO persona (nombre,apellido,genero,tip_identificacion,Telefono,fechanacimiento,documento,correo) VALUES ('"+nombre+"','"+apellido+"','"+genero+"','"+tip_identificacion+"','"+telefono+"','"+fechanacimiento+"','"+documento+"','"+correo+"') "

               conexion.query(registrar,function(error){
               if(error){
                  throw error;
                 }else{
                 console.log("Datos cargados de manera correcta");
                  res.render("registro", { mensaje: "User successfully registered",tipoMensaje: 'exito'
                  });
                }
                });
                

            }
            
        }
        });  

});





app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});