const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const neo4j = require('neo4j-driver');


module.exports = function (app) {
  //create a post

  router.post("/", async (req, res) => {
    
    const { userId, img, desc } = req.body;
    const createdAt = new Date().toISOString();  // Fecha en formato ISO como string
    
  
    const session = req.neo4jDriver.session(); 
  
    try {
      const result = await session.run(
        "CREATE (post:Post {id: apoc.create.uuid(), userId: $userId, img: $img, desc: $desc, createdAt: $createdAt, updatedAt: $createdAt}) WITH post MATCH (user:User {id: $userId}) CREATE (user)-[:POSTED]->(post) RETURN post",
        { userId, img, desc, createdAt }
      );
      
      const savedPost = result.records[0].get('post').properties;
  
      res.status(200).json(savedPost);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error creating post", error: err.message });
    } finally {
      await session.close();
    }
  });

  //update a post

  router.put("/:id", async (req, res) => {
    const postId = req.params.id;
    const { userId, ...updateFields } = req.body; // Desestructura userId y los campos a actualizar
  
    const session = req.neo4jDriver.session(); 
  
    try {
      // Primero verifica que el post pertenezca al usuario que intenta actualizarlo
      const verifyPost = await session.run(
        'MATCH (post:Post {id: $postId}) ' +
        'RETURN post.userId AS ownerUserId',
        { postId }
      );
  
      const ownerUserId = verifyPost.records[0]?.get('ownerUserId');
  
      if (!ownerUserId) {
        res.status(404).json("post not found");
        return;
      }
  
      if (ownerUserId !== userId) {
        res.status(403).json("you can update only your post");
        return;
      }
  
      // Actualiza el post si el usuario es el propietario
      const result = await session.run(
        'MATCH (post:Post {id: $postId}) ' +
        'SET post += $updateFields ' +
        'RETURN post',
        { postId, updateFields }
      );
  
      if (result.records.length > 0) {
        res.status(200).json("the post has been updated");
      } else {
        res.status(404).json("no post found");
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error updating post", error: err.message });
    } finally {
      await session.close();
    }
  });


  //delete a post

  router.delete("/:id", async (req, res) => {
    const postId = req.params.id;
    const userId = req.body.userId;
    //console.log("postId: ", req.body);
    const session = req.neo4jDriver.session(); 
  
    try {
      // Primero verifica si el post pertenece al usuario y si existe
      const verifyPost = await session.run(
        'MATCH (post:Post {id: $postId}) ' +
        'RETURN post.userId AS ownerUserId',
        { postId }
      );
  
      const ownerUserId = verifyPost.records[0]?.get('ownerUserId');
      //console.log("ownerUserId: ", ownerUserId);
      //console.log("UserId: ", userId);

      if (!ownerUserId) {
        res.status(404).json("post not found");
        return;
      }
  
      if (ownerUserId !== userId) {
        res.status(403).json("you can delete only your post");
        return;
      }
  
      // Si el post pertenece al usuario, procede a eliminarlo
      const result = await session.run(
        'MATCH (post:Post {id: $postId}) ' +
        'DETACH DELETE post',
        { postId }
      );
  
      // Si se eliminó algún nodo, result.summary.counters.updates().nodesDeleted debería ser mayor a 0
      if (result.summary.counters.updates().nodesDeleted > 0) {
        res.status(200).json("the post has been deleted");
      } else {
        res.status(404).json("no post found to delete");
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error deleting post", error: err.message });
    } finally {
      await session.close();
    }
  });


  //like / dislike a post

  router.put("/:id/like", async (req, res) => {
    const postId = req.params.id;
    const userId = req.body.userId;
  
    const session = req.neo4jDriver.session(); 
  
    try {
      // Intentar encontrar y eliminar la relación existente
      const resultDelete = await session.run(
        'MATCH (user:User {id: $userId})-[r:LIKES]->(post:Post {id: $postId}) ' +
        'DELETE r ' +
        'RETURN count(r) AS likesDeleted',
        { userId, postId }
      );
  
      if (resultDelete.records[0].get('likesDeleted').toInt() > 0) {
        res.status(200).json("The post has been disliked");
      } else {
        // Crear la relación si no existía anteriormente
        const resultCreate = await session.run(
          'MATCH (user:User {id: $userId}), (post:Post {id: $postId}) ' +
          'MERGE (user)-[:LIKES]->(post) ' +
          'RETURN count(*) AS likesAdded',
          { userId, postId }
        );
  
        if (resultCreate.records[0].get('likesAdded').toInt() > 0) {
          res.status(200).json("The post has been liked");
        } else {
          res.status(404).json("User or Post not found");
        }
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error processing like operation", error: err.message });
    } finally {
      await session.close();
    }
  });
  

  //get a post

  router.get("/:id", async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      res.status(200).json(post);
    } catch (err) {
      res.status(500).json(err);
    }
  });

  //get timeline posts

  router.get("/timeline/:id", async (req, res) => {
    const session = req.neo4jDriver.session(); 
    const userId = req.params.id;
    console.log("userID: ", userId)
    try {
      // Consulta para obtener las publicaciones del usuario y de sus amigos.
      const result = await session.run(
        `MATCH (u:User)-[:POSTED]->(p:Post)
        WHERE u.id = $userId
        OPTIONAL MATCH (u)-[:FOLLOWS]->(f:User)-[:POSTED]->(fp:Post)
        WITH p, COLLECT(DISTINCT fp) AS fps
        UNWIND (fps + [p]) AS allPosts
        RETURN DISTINCT allPosts
        ORDER BY allPosts.createdAt DESC
        LIMIT 10`, // Ajusta el límite según necesites
        { userId }
      );

      // Aquí asumimos que quieres mezclar y luego ordenar todas las publicaciones juntas. Ajusta según necesites.
      const posts = result.records.map(record => record.get('allPosts'));
      res.status(200).json(posts);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    } finally {
      await session.close();
    }
  });


  //get user's all posts

  router.get("/profile/:username", async (req, res) => {
    const session = req.neo4jDriver.session(); 
    const username = req.params.username;
    console.log("usernamme2: ", username);
    try {
      // Consulta para obtener todas las publicaciones de un usuario.
      const result = await session.run(
        `MATCH (u:User {username: $username})-[:POSTED]->(p:Post)
        RETURN p
        ORDER BY p.createdAt DESC`, // Asumiendo que quieres orden descendente.
        { username }
      );

      const posts = result.records.map(record => record.get('p').properties);

      res.status(200).json(posts);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    } finally {
      await session.close();
    }
  });

  app.use("/api/posts", router);
};
