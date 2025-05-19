const express = require("express");
const mysql = require("mysql");
const app = express();
const path = require('path');



// Define carpeta de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));



app.set("view engine", "ejs");

let conexion = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'smns'
});


app.use(express.json())
const newLocal = app.use(express.urlencoded({ extended: false }));

app.get("/registro", function(req, res)  {
    res.render("registro")
});


app.get("/contacto", function(req, res) {
    res.render("contacto");
});



app.post("/contactar",function(req, res) {
  const datos =  req.body;
  let nombre= datos.nombre;


  let registrar = "INSERT INTO contacts (nombre,timestamp) VALUES (?, NOW())"

   conexion.query(registrar,function(error){
      if(error){
        throw error;
      }else{
        console.log("Datos cargados de manera correcta");
          res.render("registro", { mensaje: "User successfully registered",
          tipoMensaje: 'exito'
            });
          }
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});