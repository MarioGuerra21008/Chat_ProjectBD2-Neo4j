const router = require("express").Router();
const Message = require("../models/Message");


module.exports = function (app) {
  
  router.post("/", async (req, res) => {
    console.log("req.body (messages): ", req.body);
    const {sender,text, conversationId} = req.body;
    const createdAt = new Date().toISOString();
    const session = req.neo4jDriver.session();
  
    try {
      // Crear el nodo Message y establecer las relaciones
      const result = await session.writeTransaction(tx =>
        tx.run(`
          CREATE (m:Message {Text: $text, Date_created: $createdAt, ID: randomUUID()})
          WITH m
          MATCH (u:User {ID: $sender}), (c:Conversation {ID: $conversationId})
          CREATE (u)-[:SENT_BY]->(m)-[:BELONGS_TO]->(c)
          RETURN m
        `, {
          text,
          sender,
          conversationId,
          createdAt
        })
      );
  
      const savedMessage = result.records[0].get('m').properties;
      res.status(200).json(savedMessage);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    } finally {
      await session.close();
    }
  });

  //get

  router.get("/:conversationId", async (req, res) => {
    const session = req.neo4jDriver.session();
    try {
      console.log("req.params.conversationId: ",req.params.conversationId);
      const result = await session.run(
        `MATCH (m:Message)-[:BELONGS_TO]->(c:Conversation)
        WHERE c.ID = $conversationId
        RETURN m ORDER BY m.Date_created`,
        { conversationId: req.params.conversationId }
      );

      const messages = result.records.map(record => {
        const message = record.get('m').properties;
        // Asegurarse de devolver solo las propiedades necesarias
        return {
          text: message.Text,
          sender: message.Username,
          createdAt: message.Date_created
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