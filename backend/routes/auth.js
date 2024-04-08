const express = require('express');
const router = express.Router();
const neo4j = require('neo4j-driver');
const bcrypt = require('bcrypt');

// URL de conexión proporcionada por AuraDB
const uri = "neo4j+s://32aa479e.databases.neo4j.io";

// Credenciales de autenticación proporcionadas por AuraDB
const user = "neo4j";
const password = "kVlo04Ku2n2fZoLXh-fRMdzB8x5Jb9WhnAneDQh7Lss";

// Crea una nueva instancia del driver de Neo4j
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

module.exports = function (app) {
  router.post("/register", async (req, res) => {
    console.log("ENTRA")
    
    const { username, email, password, confirmPassword } = req.body;


    const session = driver.session();

    try {
      const result = await session.run(
        `
        CREATE (u:User {
          username: $username,
          email: $email,
          passwordHash: $passwordHash,
          profilePicture: '',
          coverPicture: '',
          followers: [],
          following: [],
          createdAt: timestamp(),
          updatedAt: timestamp()
        })
        RETURN u
        `,
        {
          username,
          email,
          passwordHash: bcrypt.hashSync(password, 10) // Hashea la contraseña antes de guardarla
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
    const session = driver.session();

    try {
      const result = await session.run(
        'MATCH (u:User { email: $email }) RETURN u',
        { email: req.body.email }
      );

      if (result.records.length === 0) {
        return res.status(404).json("User not found");
      }

      const user = result.records[0].get('u').properties;

      const validPassword = await bcrypt.compare(req.body.password, user.passwordHash);
      if (!validPassword) {
        return res.status(400).json("Wrong password");
      }

      res.status(200).json(user);
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
