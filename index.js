const express = require("express");
const mysql = require("mysql");
const app = express();
const path = require('path');
const session = require("express-session");
const bcryptjs = require('bcryptjs'); 
const { error, time } = require("console");
const { name } = require("ejs");
const { fileURLToPath } = require("url");
const router = express.Router(); 

/*const db = require('./db'); // importa la conexión*/


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));
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




app.use(router);
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const originalRender = res.render;
  res.render = function(view, options, callback) {
    console.log(`Renderizando ${view} con datos:`, options);
    originalRender.call(this, view, options, callback);
  };
  next();
});

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

app.get("/about", function(req, res)  {
    res.render("about")
});


app.get("/services", function(req, res)  {
    res.render("services")
});


app.get("/vision", function(req, res)  {
    res.render("vision")
});

app.get("/index", function(req, res)  {
    res.render("index")
});

app.get("/contactosporgestionar", function(req, res)  {
    res.render("contactosporgestionar")
});

app.get("/cuentas", function(req, res)  {
    res.render("cuentas")
});

app.get("/detallecontacto", function(req, res) {
    res.render("detallecontacto");
});

app.get("/detalle-caso", function(req, res) {
    res.render("detalle-caso");
});

app.get("/crear_caso", function(req, res) {
    res.render("crear_caso");
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
          case 5: //  administrador
            res.redirect('/perfil');
            break;
          case 2: 
            res.redirect('/registro');
            break;
          default:
            res.redirect('/contacto'); 
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

// llamda de lso registros de contacto

app.get('/api/contactos', (req, res) => {
  const sql = 'SELECT * FROM contacts ORDER BY id DESC' ; 
  conexion.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener los contactos:', err);
      return res.status(500).send('Error en el servidor');
    }
    res.json(results); 
  });
});

//update de observaciones 
app.post('/guardar-observacion', (req, res) => {
  const { id, observacion } = req.body;
  const sql = 'UPDATE contacts SET observaciones = ? WHERE id = ?';

  conexion.query(sql, [observacion, id], (err, result) => {
    if (err) {
      console.error('Error al guardar observación:', err);
      return res.status(500).send('Error al guardar');
    }
    res.send('OK');
  });
});

app.post('/actualizar-estado', (req, res) => {
  const { id, estado } = req.body;

  const sql = 'UPDATE contacts SET estado = ? WHERE id = ?';
  conexion.query(sql, [estado, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar el estado:', err);
      return res.status(500).send('Error en el servidor');
    }
    res.send('Estado actualizado correctamente');
  });
});

//cuentas de usuario

app.get('/api/personas', (req, res) => {
  const sql = 'SELECT * FROM persona ORDER BY id DESC' ; 
  conexion.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener los contactos:', err);

      return res.status(500).send('Error en el servidor');
    }
    res.json(results); 
  });
});

//detalle de contacto por id


app.get('/api/personas/:id', (req, res) => {
    const id = req.params.id;
    
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID no válido' });
    }

    const sql = `
        SELECT p.*, u.*, c.casonumero, c.tipo_caso, c.fecha_creacion, c.fecha_actualizacion, c.estado, d.rol AS nombre_rol
        FROM persona p 
        LEFT JOIN usuarios u ON p.id = u.idusuarios 
        LEFT JOIN PROCESOS c ON p.id = c.idusuario
        LEFT JOIN rol d ON d.idrol = u.id_rol
        WHERE p.id = ?
    `;
    
    conexion.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener el contacto:', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Contacto no encontrado' });
        }
        
        // Organizar los datos
        const response = {
            id: results[0].id,
            nombre: results[0].nombre,
            apellido: results[0].apellido,
            login: results[0].login,
            id_rol: results[0].id_rol,
            nombre_rol: results[0].nombre_rol || 'No especificado',
            correo: results[0].correo,
            telefono: results[0].telefono,
            pais: results[0].pais,
            casos: results
                .filter(row => row.casonumero !== null)
                .map(row => ({
                    numero: row.casonumero,
                    tipo: row.tipo_caso || 'No especificado',
                    fecha_creacion: row.fecha_creacion ? (row.fecha_creacion) : 'No especificada',
                    fecha_actualizacion: row.fecha_actualizacion ? (row.fecha_actualizacion) : 'No actualizado',
                    estado: row.estado || 'No especificado'
                }))
        };
        
        res.json(response);
    });
});



// Edetalle caso

app.get('/api/procesos/:casonumero', (req, res) => {
    const casonumero = req.params.casonumero;
    
    if (isNaN(casonumero)) {
        return res.status(400).json({ error: 'Número de caso no válido' });
    }

    const sql = `
        SELECT p.casonumero, p.tipo_caso, p.fecha_creacion, p.observaciones,
               p.fecha_actualizacion, p.estado,
               per.nombre, per.apellido
        FROM procesos p 
        LEFT JOIN persona per ON p.idusuario = per.id
        WHERE p.casonumero = ?
    `;
    
    conexion.query(sql, [casonumero], (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Caso no encontrado' });
        }
        
        const response = {
            casonumero: results[0].casonumero,
            nombre: results[0].nombre || 'No especificado',
            apellido: results[0].apellido || 'No especificado',
            casos: results.map(row => ({
                casonumero: row.casonumero,
                tipo: row.tipo_caso || 'No especificado',
                fecha_creacion: row.fecha_creacion || 'No especificada',
                fecha_actualizacion: row.fecha_actualizacion || 'No actualizado',
                estado: row.estado || 'No especificado',
                observaciones: row.observaciones || ''
            }))
        };
        
        res.json(response);
    });
});

// Nuevo endpoint para obtener observaciones
app.get('/api/procesos/:casonumero/observaciones', (req, res) => {
    const casonumero = req.params.casonumero;
    
    if (isNaN(casonumero)) {
        return res.status(400).json({ error: 'Número de caso no válido' });
    }

    const sql = `
        SELECT o.id, o.observacion AS texto, o.fecha_creacion AS fecha 
        FROM observaciones o
        LEFT JOIN usuarios u ON o.id_usuario = u.idusuarios
        WHERE o.casonumero = ?
        ORDER BY o.fecha_creacion DESC`;
    
    conexion.query(sql, [casonumero], (err, results) => {
        if (err) {
            console.error('Error al obtener observaciones:', err);
            return res.status(500).json({ error: 'Error al obtener observaciones' });
        }
        
        const observaciones = results.map(row => ({
            id: row.id,
            texto: row.texto,
            fecha: row.fecha,
            usuario: `${row.nombre || 'Anónimo'} ${row.apellido || ''}`.trim()
        }));
        
        res.json(observaciones);
    });
});


// Ruta para insertar observaciones - Versión corregida
app.post('/api/procesos/:casonumero/observaciones', async (req, res) => {
    const { casonumero } = req.params;
    const { observacion, id_usuario } = req.body;

    if (isNaN(casonumero)) {
        return res.status(400).json({ 
            success: false,
            error: 'Número de caso no válido' 
        });
    }

    if (!observacion || observacion.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'La observación no puede estar vacía'
        });
    }

    // Función para ejecutar consultas con promesas
    const query = (sql, params) => {
        return new Promise((resolve, reject) => {
            conexion.query(sql, params, (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    };

    try {
        // Verificar que el caso existe
        const caso = await query(
            'SELECT casonumero FROM procesos WHERE casonumero = ?', 
            [casonumero]
        );
        
        if (caso.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Caso no encontrado'
            });
        }

        // Insertar la observación
        const result = await query(
            `INSERT INTO observaciones 
             (observacion, id_usuario, casonumero, fecha_creacion) 
             VALUES (?, ?, ?, NOW())`,
            [observacion.trim(), id_usuario || null, casonumero]
        );

        res.status(201).json({
            success: true,
            message: 'Observación creada',
            id: result.insertId
        });

    } catch (error) {
        console.error('Error al insertar observación:', error);
        res.status(500).json({
            success: false,
            error: 'Error al guardar la observación',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});


app.post('/actualizar-estado', (req, res) => {
  const { casonumero, estado } = req.body;
  const usuarioId = req.user?.id || 'sistema'; // Asume autenticación o usa 'sistema'

  // Validar el estado
  const estadosPermitidos = ['Abierto', 'En trámite', 'Tramitado'];
  if (!estadosPermitidos.includes(estado)) {
    return res.status(400).json({ 
      success: false,
      error: 'Estado no válido. Los permitidos son: Pendiente, En trámite, Tramitado'
    });
  }

  // 1. Actualizar el proceso
  const sqlUpdate = 'UPDATE procesos SET estado = ?, fecha_actualizacion = NOW() WHERE casonumero = ?';
  conexion.query(sqlUpdate, [estado, casonumero], (err, result) => {
    if (err) {
      console.error('Error al actualizar estado:', err);
      return res.status(500).json({ 
        success: false,
        error: 'Error en el servidor'
      });
    }

    // 2. Registrar observación automática (opcional)
    const observacion = `Estado actualizado a: ${estado}`;
    const sqlObs = 'INSERT INTO observaciones (proceso_id, usuario_id, texto) VALUES ((SELECT id FROM procesos WHERE casonumero = ?), ?, ?)';
    
    conexion.query(sqlObs, [casonumero, usuarioId, observacion], (errObs) => {
      if (errObs) {
        console.error('Error al registrar observación:', errObs);
        // Continuamos aunque falle la observación
      }

      res.json({
        success: true,
        message: 'Estado actualizado correctamente',
        nuevoEstado: estado
      });
    });
  });
});


// Endpoint para actualizar estado (PUT)
app.put('/api/procesos/:casonumero/estado', async (req, res) => {
    const { casonumero } = req.params;
    const { estado } = req.body;
    const usuarioId = req.user?.id || 'sistema';

    // Validar el estado
    const estadosPermitidos = ['Pendiente', 'En trámite', 'Tramitado'];
    if (!estadosPermitidos.includes(estado)) {
        return res.status(400).json({ 
            success: false,
            error: 'Estado no válido. Los permitidos son: Pendiente, En trámite, Tramitado'
        });
    }

    try {
        // 1. Actualizar el proceso
        const updateResult = await new Promise((resolve, reject) => {
            const sqlUpdate = 'UPDATE procesos SET estado = ?, fecha_actualizacion = NOW() WHERE casonumero = ?';
            conexion.query(sqlUpdate, [estado, casonumero], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Caso no encontrado'
            });
        }

        // 2. Registrar observación automática (opcional)
        const observacion = `Estado actualizado a: ${estado}`;
        try {
            await new Promise((resolve, reject) => {
                const sqlObs = `INSERT INTO observaciones 
                               (observacion, id_usuario, casonumero, fecha_creacion) 
                               VALUES (?, ?, ?, NOW())`;
                conexion.query(sqlObs, [observacion, usuarioId, casonumero], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });
        } catch (obsError) {
            console.error('Error al registrar observación:', obsError);
            // Continuamos aunque falle la observación
        }

        res.json({
            success: true,
            message: 'Estado actualizado correctamente',
            nuevoEstado: estado
        });

    } catch (error) {
        console.error('Error al actualizar estado:', error);
        res.status(500).json({
            success: false,
            error: 'Error en el servidor al actualizar el estado'
        });
    }
});


router.get('/api/personas/search', async (req, res) => {
    const { q: searchTerm } = req.query;
    
    // Validación mejorada
    if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length < 3) {
        return res.status(400).json({ 
            success: false,
            error: 'Debe proporcionar al menos 3 caracteres para la búsqueda',
            code: 'SEARCH_TERM_TOO_SHORT'
        });
    }

    // Sanitización del término
    const sanitizedTerm = searchTerm.trim().replace(/[%_]/g, '\\$&');
    const likeTerm = `%${sanitizedTerm}%`;

    try {
        // Verificar conexión a la base de datos
        await pool.query('SELECT 1');
        
        // Consulta optimizada
        const [personas] = await pool.query(`
            SELECT 
                id, 
                CONCAT(nombre, ' ', apellido) AS nombre_completo,
                nombre,
                apellido,
                tipo_documento, 
                numero_documento,
                telefono,
                email
            FROM personas 
            WHERE 
                nombre LIKE ? 
                OR apellido LIKE ? 
                OR numero_documento LIKE ?
            ORDER BY nombre, apellido
            LIMIT 20
        `, [likeTerm, likeTerm, likeTerm]);

        // Formatear respuesta para el frontend
        const formattedResults = personas.map(p => ({
            id: p.id,
            nombre: p.nombre,
            apellido: p.apellido,
            nombre_completo: p.nombre_completo,
            tipo_documento: p.tipo_documento,
            numero_documento: p.numero_documento,
            telefono: p.telefono,
            email: p.email
        }));

        if (formattedResults.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'No se encontraron personas con ese criterio',
                code: 'NO_RESULTS_FOUND'
            });
        }

        res.json(formattedResults);

    } catch (error) {
        console.error('Error en búsqueda de personas:', error);
        
        const errorResponse = {
            success: false,
            error: 'Error interno del servidor al buscar personas',
            code: 'INTERNAL_SERVER_ERROR'
        };

        if (process.env.NODE_ENV === 'development') {
            errorResponse.details = {
                message: error.message,
                sqlError: error.sqlMessage,
                stack: error.stack
            };
        }

        res.status(500).json(errorResponse);
    }
});

module.exports = router;

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});