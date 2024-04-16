const express = require('express');
const router = express.Router();
const neo4j = require('neo4j-driver');
const bcrypt = require('bcrypt');
const crypto = require('crypto');


function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

module.exports = function (app) {
  router.post("/register", async (req, res) => {
    console.log("ENTRA");
    
    const { username, email, password } = req.body;
    // Asumiendo que bcrypt ya está requerido arriba en tu archivo
    const session = req.neo4jDriver.session(); // Obtiene la sesión del driver inyectado

    try {
      const result = await session.run(
        `
        CREATE (u:User {
          id: apoc.create.uuid(),
          username: $username,
          email: $email,
          passwordHash: $passwordHash,
          profilePicture: '',
          coverPicture: '',
          followers: [],
          following: [],
          createdAt: datetime(),
          updatedAt: datetime()
        })
        RETURN u
        `,
        {
          username,
          email,
          passwordHash: bcrypt.hashSync(password, 10) // Asegúrate de tener bcrypt disponible
        }
      );

      const user = result.records[0].get('u').properties;
      res.status(200).json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      await session.close();
    }
  });

  router.post("/login", async (req, res) => {
    const session = req.neo4jDriver.session(); // Obtiene la sesión del driver inyectado
    console.log("LOGIN: ", req.body);
    username = req.body.username;

    const hashedInputPassword = hashPassword(req.body.password);
    // Cambio para usar username en lugar de email
    try {
      const result = await session.run(
        'MATCH (u:User {Username: $username}) RETURN u', // Cambiado de email a username
        { username }
      );
  
      if (result.records.length === 0) {
        return res.status(404).json("User not found");
      }
  
      const user = result.records[0].get('u').properties;
  
      console.log("User: ", user.PasswordHash);
      if (hashedInputPassword === user.PasswordHash) {
        res.status(200).json(user); // Contraseña correcta
      } else {
        return res.status(400).json("Wrong password"); // Contraseña incorrecta
      }
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      await session.close();
    }
  });
  
  // Monta el enrutador en la aplicación Express
  app.use("/api/auth", router);

};
