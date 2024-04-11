const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const neo4j = require('neo4j-driver');


module.exports = function (app) {
  //create a post

  router.post("/", async (req, res) => {
    const newPost = new Post(req.body);
    try {
      const savedPost = await newPost.save();
      res.status(200).json(savedPost);
    } catch (err) {
      res.status(500).json(err);
    }
  });
  //update a post

  router.put("/:id", async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (post.userId === req.body.userId) {
        await post.updateOne({ $set: req.body });
        res.status(200).json("the post has been updated");
      } else {
        res.status(403).json("you can update only your post");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  });
  //delete a post

  router.delete("/:id", async (req, res) => {
    try {
      
      const post = await Post.findById(req.params.id);
      if (post.userId === req.body.userId) {
        await post.deleteOne();
        res.status(200).json("the post has been deleted");
      } else {
        res.status(403).json("you can delete only your post");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  });
  //like / dislike a post

  router.put("/:id/like", async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post.likes.includes(req.body.userId)) {
        await post.updateOne({ $push: { likes: req.body.userId } });
        res.status(200).json("The post has been liked");
      } else {
        await post.updateOne({ $pull: { likes: req.body.userId } });
        res.status(200).json("The post has been disliked");
      }
    } catch (err) {
      res.status(500).json(err);
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
    console.log("userID: ", req.params.userId)
    const userId = req.params.id;
    console.log("userID: ", userId)
    console.log("XDDDDDDDDD")
    try {
      // Consulta para obtener las publicaciones del usuario y de sus amigos.
      const result = await session.run(
        `MATCH (u:User)-[:POSTED]->(p:Post)
        WHERE u.id = $userId
        OPTIONAL MATCH (u)-[:FOLLOWS]->(f:User)-[:POSTED]->(fp:Post)
        RETURN p, fp
        ORDER BY p.createdAt DESC, fp.createdAt DESC
        LIMIT 10`, // Ajusta el límite según necesites
        { userId }
      );

      // Aquí asumimos que quieres mezclar y luego ordenar todas las publicaciones juntas. Ajusta según necesites.
      const posts = [];
      result.records.forEach(record => {
        if (record.get('p')) {
          posts.push(record.get('p').properties);
        }
        if (record.get('fp')) {
          posts.push(record.get('fp').properties);
        }
      });

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
