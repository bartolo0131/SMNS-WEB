
## Installation

Debes clonar el repositorio y dentro de la carpeta backend correr los siguientes comandos. Ten encuenta que si no tienes node js debes instalarlo.

```bash
  npm install
```

Dentro del archivo db.js Agregar los datos de la conexión a la base de datos que estás ejecutando en local.
```js
  const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'dataBase_name'
});
```

Dentro de la carpeta backend ingregas a la terminal y corres el servicio de express 


  
```bash
  node server.js
``` 

Después de eso puedes probar la conexión usando el formulario de la página de login.
## Tech Stack

**Server:** Node, Express

