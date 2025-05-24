const express = require("express");
const mysql = require("mysql");
const app = express();
const path = require('path');
const session = require("express-session");
const bcryptjs = require('bcryptjs'); 
const { error, time } = require("console");
const { name } = require("ejs");
const { fileURLToPath } = require("url");


app.use(express.static(path.join(__dirname, 'public')));
/*
app.set('view'join(__dirname,'views'))  
*/
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

//conexion con el servidor 

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





app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.urlencoded({ extended: true }));

//renderisamos las vistas 

app.get("/contacto", function(req, res) {
    res.render("contacto");
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/perfil", function(req, res) {
    res.render("perfil");
});

app.get("/registro", function(req, res)  {
    res.render("registro")
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
          alert: true,
          alertTitle: 'Credenciales erradas',
          alertMessage: 'USUARIO O CONTRASEÑA INCORRECTOS',
          alertIcon: 'error',
          showconfirmButton: false,
          time: false,
          ruta: 'login'
        });
      } else {
        // Guardar datos en sesión
        req.session.loggedin = true;
        req.session.name = results[0].login;
        req.session.id_rol = results[0].id_rol;

        // Redirigir según rol
        switch (results[0].id_rol) {
          case 5: // Ejemplo: administrador
            res.redirect('/perfil');
            break;
          case 2: // Ejemplo: usuario estándar
            res.redirect('/registro');
            break;
          default:
            res.redirect('/contacto'); // Página por defecto
        }
      }
    });
  } else {
    res.render('login', {
      alert: true,
      alertTitle: 'Campos vacíos',
      alertMessage: 'Por favor, llena todos los campos',
      alertIcon: 'warning',
      showconfirmButton: true,
      time: false,
      ruta: 'login'
    });
  }
});

//cerrar cesion 

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.send('Error al cerrar sesión');
    }
    res.redirect('/contacto');  // O la ruta que tengas para login
  });
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