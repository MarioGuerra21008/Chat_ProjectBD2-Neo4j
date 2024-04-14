const router = require("express").Router();
const Message = require("../models/Message");


module.exports = function (app) {
  
  //add
  router.post("/", async (req, res) => {
    const newMessage = new Message(req.body);

    try {
      const savedMessage = await newMessage.save();
      res.status(200).json(savedMessage);
    } catch (err) {
      res.status(500).json(err);
    }
  });

  //get

  router.get("/:conversationId", async (req, res) => {
    const session = req.neo4jDriver.session();
    try {
      console.log("req.params.conversationId: ",req.params.conversationId);
      const result = await session.run(
        `MATCH (m:Message)-[:BELONGS_TO]->(c:Conversation)
        WHERE c.id = $conversationId
        RETURN m ORDER BY m.createdAt`,
        { conversationId: req.params.conversationId }
      );

      const messages = result.records.map(record => {
        const message = record.get('m').properties;
        // Asegurarse de devolver solo las propiedades necesarias
        return {
          text: message.text,
          sender: message.sender,
          createdAt: message.createdAt
        };
      });

      res.status(200).json(messages);
      console.log("Neo4j Messages Retrieved");
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    } finally {
      await session.close();
    }
  });

  // Monta el enrutador en la aplicación Express
  app.use("/api/messages", router);
}