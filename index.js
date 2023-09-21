const express = require('express');
const app = express();
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xvker.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const database = client.db("bistroDb");
    const menuCollection = database.collection("menu");
    const cartCollection = database.collection("cart");
    const userCollection = database.collection("user");

    app.get('/menu', async(req, res)=>{
        const result = await menuCollection.find({}).toArray();
        res.send(result);
    })

    // user apis
    app.get('/users', async(req, res)=>{
      const result = await userCollection.find({}).toArray();
      res.send(result)
    })
    app.patch('/users/admin', async(req, res)=>{
        
        const email = req.query.email
        const query= {email: email}
        const updateDoc ={
          $set: {
            role: 'admin',
          }
        }

        const result = await userCollection.updateOne(query, updateDoc);
        res.send(result)
    })
   app.post('/users', async(req, res)=>{
    const data = req.body;
    const query = {email: data.email}
    const r = await userCollection.findOne(query);
    if(r){
      res.send("user already exists")
    }else{
      const result = await userCollection.insertOne(data);
      res.send(result)
    }
    
   })
    //cart apis
    app.get('/carts', async(req, res)=>{

      const email= req.query.email;
      const query ={email: email}
      const result = await cartCollection.find(query).toArray();
      res.send(result)
    })
    app.delete('/carts/:id', async(req, res)=>{

      const id= req.params.id;
      console.log(id)
      const option ={_id: new ObjectId(id)}
      const result = await cartCollection.deleteOne(option);
      res.send(result)
    })

    
    app.post('/carts', async(req, res)=>{
      const data = req.body;
      
      const result = await cartCollection.insertOne(data);
      res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res)=>{
    res.send("boss is running")
})

app.listen(port, ()=>{
    console.log(`bistro boss is running on port ${port}`)
})