const router = require("express").Router();
const Conversation = require("../models/Conversation");

//new conv
module.exports = function (app) {
  router.post("/", async (req, res) => {
    const newConversation = new Conversation({
      members: [req.body.senderId, req.body.receiverId],
    });

    try {
      const savedConversation = await newConversation.save();
      res.status(200).json(savedConversation);
    } catch (err) {
      res.status(500).json(err);
    }
  });

  //get conv of a user

  router.get("/:userId", async (req, res) => {
    const session = req.neo4jDriver.session();
    //console.log("Entra?");
    try {
      console.log("req.params.userId: ",req.params.userId);
      const result = await session.run(
        `MATCH (u:User)-[:CHATS_WITH]->(c:Conversation)
        WHERE u.ID = $userId
        RETURN c`,
        { userId: req.params.userId }
      );

      const conversations = result.records.map(record => {
        return record.get("c").properties;
      });

      res.status(200).json(conversations);
      console.log("Neo4j Retrieve");
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    } finally {
      await session.close();
    }
  });

  //obtain friendid
  router.get('/:currentUserId/:conversationId', async (req, res) => {
    const { currentUserId, conversationId } = req.params;
    const session = req.neo4jDriver.session();
    
    try {
      const result = await session.run(
        `MATCH (currentUser:User {ID: $currentUserId})-[:CHATS_WITH]->(c:Conversation)<-[:CHATS_WITH]-(otherUser:User)
         WHERE c.ID = $conversationId AND NOT currentUser.ID = otherUser.ID
         RETURN otherUser.ID AS friendId`,
        { currentUserId, conversationId }
      );
  
      if (result.records.length > 0) {
        const friendId = result.records[0].get('friendId');
        res.status(200).json({ friendId });
      } else {
        res.status(404).send('Friend not found');
      }
    } catch (err) {
      console.error('Error accessing Neo4j', err);
      res.status(500).json({ error: err.message });
    } finally {
      await session.close();
    }
  });

  // get conv includes two userId

  router.get("/find/:firstUserId/:secondUserId", async (req, res) => {
    try {
      const conversation = await Conversation.findOne({
        members: { $all: [req.params.firstUserId, req.params.secondUserId] },
      });
      res.status(200).json(conversation)
    } catch (err) {
      res.status(500).json(err);
    }
  });

  // Monta el enrutador en la aplicación Express
  app.use("/api/conversations", router);
}
