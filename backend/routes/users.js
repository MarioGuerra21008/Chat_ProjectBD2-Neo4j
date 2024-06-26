const router = require("express").Router();
const bcrypt = require("bcrypt");
const neo4j = require('neo4j-driver');


module.exports = function (app) {
  //update user
  router.put("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
      if (req.body.password) {
        try {
          const salt = await bcrypt.genSalt(10);
          req.body.password = await bcrypt.hash(req.body.password, salt);
        } catch (err) {
          return res.status(500).json(err);
        }
      }
      try {
        const user = await User.findByIdAndUpdate(req.params.id, {
          $set: req.body,
        });
        res.status(200).json("Account has been updated");
      } catch (err) {
        return res.status(500).json(err);
      }
    } else {
      return res.status(403).json("You can update only your account!");
    }
  });

  //delete user
  router.delete("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
      try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json("Account has been deleted");
      } catch (err) {
        return res.status(500).json(err);
      }
    } else {
      return res.status(403).json("You can delete only your account!");
    }
  });

  router.get("/", async (req, res) => {
    const userId = req.query.userId;
    const username = req.query.username;
  
    const session = req.neo4jDriver.session(); 
    //console.log("Dentro: ", userId)
    try {
      let user;
      if (userId) {
        // Consulta Neo4j para buscar por ID
        const result = await session.run(
          'MATCH (user:User {ID: $userId}) RETURN user',
          { userId: userId }
        );
        user = result.records.map(record => record.get('user').properties)[0];
      } else if (username) {
        // Consulta Neo4j para buscar por nombre de usuario
        const result = await session.run(
          'MATCH (user:User {Username: $username}) RETURN user',
          { username: username }
        );
        user = result.records.map(record => record.get('user').properties)[0];
      }
  
      if (user) {
        const { password, updatedAt, ...other } = user;
        res.status(200).json(other);
      } else {
        res.status(404).send('User not found');
      }
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    } finally {
      await session.close();
    }
  });

  //OBTENER REGISTROS INGRESADOS POr EL USUARIO
  router.post('/search', async (req, res) => {
    try {
      const { query } = req.body;

      // Realizar la agregación en la colección Users
      const usersResult = await User.aggregate([
        {
          $match: {
            $or: [
              { username: { $regex: query, $options: 'i' } },
              { email: { $regex: query, $options: 'i' } },
            ],
          },
        },
        { $limit: 3 }
      ]);

      // Realizar la agregación en la colección Posts
      const postsResult = await Post.aggregate([
        {
          $match: {
            $or: [
              { desc: { $regex: query, $options: 'i' } },
              { userId: { $in: usersResult.map(user => user._id) } },
            ],
          },
        },
        { $limit: 3 }
      ]);

      res.status(200).json({ users: usersResult, posts: postsResult });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get("/friends/:userId", async (req, res) => {
    console.log("Id del usuario", req.params.userId);
    const session = req.neo4jDriver.session();

    try {
      // Reemplaza 'userId' con el nombre de campo apropiado si es necesario
      const result = await session.run(
        `MATCH (u:User {ID: $userId})-[:FOLLOWS]->(f:User)
        RETURN f.ID AS id, f.Username AS username, f.profilePicture AS profilePicture`,
        { userId: req.params.userId }
      );

      const friends = result.records.map(record => {
        return {
          _id: record.get('id'), // Ajusta según cómo manejes los IDs
          username: record.get('username'),
          profilePicture: record.get('profilePicture'),
        };
      });

      res.status(200).json(friends);
    } catch (err) {
      console.error(err);
      res.status(500).json(err.message);
    } finally {
      await session.close();
    }
  });


  //follow a user

  router.put("/:id/follow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
      try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId);
        if (!user.followers.includes(req.body.userId)) {
          await user.updateOne({ $push: { followers: req.body.userId } });
          await currentUser.updateOne({ $push: { followings: req.params.id } });
          res.status(200).json("user has been followed");
        } else {
          res.status(403).json("you allready follow this user");
        }
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(403).json("you cant follow yourself");
    }
  });

  //unfollow a user

  router.put("/:id/unfollow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
      try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId);
        if (user.followers.includes(req.body.userId)) {
          await user.updateOne({ $pull: { followers: req.body.userId } });
          await currentUser.updateOne({ $pull: { followings: req.params.id } });
          res.status(200).json("user has been unfollowed");
        } else {
          res.status(403).json("you dont follow this user");
        }
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(403).json("you cant unfollow yourself");
    }
  });

  // Ejemplo de una ruta en Express para verificar la relación FOLLOWS
router.get('/check-follow/:currentUserId/:targetUserId', async (req, res) => {
  const { currentUserId, targetUserId } = req.params;
  const session = req.neo4jDriver.session();

  try {
      const result = await session.run(
          'MATCH (a:User {ID: $currentUserId})-[r:FOLLOWS]->(b:User {ID: $targetUserId}) RETURN r',
          { currentUserId, targetUserId }
      );

      // Si el resultado tiene al menos una relación, entonces el usuario actual sigue al usuario de destino
      const follows = result.records.length > 0;
      res.status(200).json({ follows });
  } catch (error) {
      console.error('Failed to check follow status:', error);
      res.status(500).json({ error: 'Internal server error' });
  } finally {
      await session.close();
  }
});

router.post('/:userId/hobbies', async (req, res) => {
  console.log(req.params);
  const userId = req.params.userId;
  const hobbies = req.body.hobbies;
  console.log("hobbies: ", hobbies);
  const session = req.neo4jDriver.session();
  
  try {
    // Transacción para crear los nodos y las relaciones
    const result = await session.writeTransaction(tx =>
      tx.run(
        `
        MATCH (user:User {ID: $userId})
        UNWIND $hobbies AS hobby
        MERGE (h:Hobby {name: hobby})
        MERGE (user)-[:LIKES_HOBBY]->(h)
        RETURN h
        `,
        { userId, hobbies }
      )
    );

    const hobbiesCreated = result.records.map(record => record.get('h').properties);
    res.status(200).json({ message: "Hobbies updated successfully!", hobbies: hobbiesCreated });
  } catch (error) {
    console.error('Error updating hobbies:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await session.close();
  }
});


  app.use("/api/users", router);
}
