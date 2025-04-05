const connection = require('./db');

const query = 'DELETE FROM rol WHERE idrol = ?';
const values = [6]; // El ID del rol que quieres eliminar

connection.query(query, values, (err, result) => {
    if (err) throw err;
    console.log(`✅ ${result.affectedRows} registro(s) eliminado(s)`);
    connection.end();
});

