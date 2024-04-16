const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const neo4j = require('neo4j-driver');


module.exports = function (app) {
  //create a post

  router.post("/", async (req, res) => {
    
    const { userId, img, desc } = req.body;
    const createdAt = new Date().toISOString();  // Fecha en formato ISO como string
    
    console.log(req.body)
  
    const session = req.neo4jDriver.session(); 
  
    try {
      const result = await session.run(
        "CREATE (post:Post {ID: apoc.create.uuid(), Username: $userId, Image: $img, Post: $desc, Post_created: $createdAt, Post_updated: $createdAt}) WITH post MATCH (user:User {ID: $userId}) CREATE (user)-[:POSTED]->(post) RETURN post",
        { userId, img, desc, createdAt },
        console.log(userId)
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
        'MATCH (post:Post {ID: $postId}) ' +
        'RETURN post.Username AS ownerUserId',
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
        'MATCH (post:Post {ID: $postId}) ' +
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
        'MATCH (post:Post {ID: $postId}) ' +
        'RETURN post.Username AS ownerUserId',
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
        'MATCH (post:Post {ID: $postId}) ' +
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

  // Actualizar un post (incluyendo la propiedad "location")
  router.put("/:id/location", async (req, res) => {
    const postId = req.params.id;
    const { userId, location, ...updateFields } = req.body; // Desestructura userId, location y los campos a actualizar

    const session = req.neo4jDriver.session(); 

    try {
      // Primero verifica que el post pertenezca al usuario que intenta actualizarlo
      const verifyPost = await session.run(
        'MATCH (post:Post {ID: $postId}) ' +
        'RETURN post.Username AS ownerUserId',
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
        'MATCH (post:Post {ID: $postId}) ' +
        'SET post.location = $location ' + // Aquí se añade la propiedad "location" al nodo
        'SET post += $updateFields ' +
        'RETURN post',
        { postId, location, updateFields }
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

  router.put("/:id/location/delete", async (req, res) => {
    const postId = req.params.id;
    const session = req.neo4jDriver.session(); 
  
    try {
      const result = await session.run(
        'MATCH (post:Post {ID: $postId}) ' +
        'REMOVE post.location ' +
        'RETURN post',
        { postId }
      );
  
      // Resto del código...
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error deleting post location", error: err.message });
    } finally {
      await session.close();
    }
  });

  router.post('/addILoveToLike', async (req, res) => {
    const { userId, postId} = req.body;
    const session = req.neo4jDriver.session(); 
  
    console.log("userId (posts): ", userId);
    console.log("postId (posts): ", postId);

    try {
      const result = await session.run(
        `MATCH (u:User)-[r:LIKES]->(p:Post)
         WHERE u.ID = $userId AND p.ID = $postId
         SET r.\`I Love\` = CASE r.\`I Love\` WHEN 1 THEN 0 ELSE 1 END
         RETURN r`,
        { userId, postId }
      );
      res.status(200).json({ message: 'I Love added successfully', data: result.records });
    } catch (err) {
      console.error('Error adding I Love to LIKE relationship:', err);
      res.status(500).json({ message: 'Error adding I Love', error: err });
    } finally {
      await session.close();
    }
  });
  
    // Actualizar la descripción de todos los posts de un usuario
  router.put("/updateDescription/:userId", async (req, res) => {
    const userId = req.params.userId;
    console.log(userId)
    const { Post } = req.body;

    const session = req.neo4jDriver.session();

    try {
      await session.run(
        'MATCH (p:Post {Username: $userId}) ' +
        'SET p.Post = $Post',
        { userId, Post }
      );

      res.status(200).json("Descriptions updated successfully");
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error updating post descriptions", error: err.message });
    } finally {
      await session.close();
    }
  });

  // Eliminar todas las imágenes de los posts de un usuario
  router.put("/deleteImages/:userId", async (req, res) => {
    const userId = req.params.userId;

    const session = req.neo4jDriver.session();

    try {
      await session.run(
        'MATCH (p:Post {Username: $userId}) ' +
        'REMOVE p.Image',
        { userId }
      );

      res.status(200).json("Images deleted successfully");
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error deleting post images", error: err.message });
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
        'MATCH (user:User {ID: $userId})-[r:LIKES]->(post:Post {ID: $postId}) ' +
        'DELETE r ' +
        'RETURN count(r) AS likesDeleted',
        { userId, postId }
      );
      //AAAAA
      if (resultDelete.records[0].get('likesDeleted').toInt() > 0) {
        res.status(200).json("The post has been disliked");
      } else {
        // Crear la relación si no existía anteriormente
        const resultCreate = await session.run(
          'MATCH (user:User {ID: $userId}), (post:Post {ID: $postId}) ' +
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
    console.log(req.params);
    const userId = req.params.id;
    console.log("userID: ", userId)
    try {
      // Consulta para obtener las publicaciones del usuario y de sus amigos.
      const result = await session.run(
        `MATCH (u:User)-[:POSTED]->(p:Post)
        WHERE u.ID = $userId
        OPTIONAL MATCH (u)-[:FOLLOWS]->(f:User)-[:POSTED]->(fp:Post)
        WITH p, COLLECT(DISTINCT fp) AS fps
        UNWIND (fps + [p]) AS allPosts
        RETURN DISTINCT allPosts
        ORDER BY allPosts.Post_created DESC
        LIMIT 5`, // Ajusta el límite según necesites
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
        `MATCH (u:User {Username: $username})-[:POSTED]->(p:Post)
        RETURN p
        ORDER BY p.Post_created DESC`, // Asumiendo que quieres orden descendente.
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


router.post("/addComment", async (req, res) => {
  const session = req.neo4jDriver.session();
  const { userId, postId, comment } = req.body;

  try {
      const result = await session.run(
          `MATCH (u:User)-[r:POSTED]->(p:Post)
           WHERE u.ID = $userId AND p.ID = $postId
           SET r.comments = $comment
           RETURN p.title, r.comments`,  // Asumimos que quieres devolver el título del post y el comentario actualizado.
          { userId, postId, comment }
      );

      if (result.records.length > 0) {
          const updatedComment = result.records[0].get('r.comments');
          const postTitle = result.records[0].get('p.title');
          res.status(200).json({ message: 'Comment added successfully', postTitle, updatedComment });
      } else {
          res.status(404).json({ message: 'Post or user not found' });
      }
  } catch (error) {
      console.error('Error adding comment to POSTED relationship:', error);
      res.status(500).json({ error: error.message });
  } finally {
      await session.close();
  }
});


router.post("/removeComment", async (req, res) => {
  const session = req.neo4jDriver.session();
  const { userId, postId } = req.body;

  try {
      const result = await session.run(
          `MATCH (u:User)-[r:POSTED]->(p:Post)
           WHERE u.ID = $userId AND p.ID = $postId
           REMOVE r.comments
           RETURN p.title, r.comments`,  // Asumimos que quieres devolver el título del post para verificar.
          { userId, postId }
      );

      if (result.records.length > 0) {
          const postTitle = result.records[0].get('p.title');
          res.status(200).json({ message: 'Comment removed successfully', postTitle });
      } else {
          res.status(404).json({ message: 'Post or user not found' });
      }
  } catch (error) {
      console.error('Error removing comment from POSTED relationship:', error);
      res.status(500).json({ error: error.message });
  } finally {
      await session.close();
  }
});
