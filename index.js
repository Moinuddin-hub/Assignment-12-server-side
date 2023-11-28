const express = require('express')
const app = express()
require('dotenv').config()
const cors=require('cors')
const port = process.env.PORT || 5000

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// const uri = "mongodb+srv://moincse022:CjiYikRsTLamoo7s@cluster0.csoydck.mongodb.net/?retryWrites=true&w=majority";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.csoydck.mongodb.net/?retryWrites=true&w=majority`;
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

    const packageCollection=client.db("TouristDb").collection("package");
    const cartCollection=client.db("TouristDb").collection("carts");
    app.get('/package',async(req,res)=>{
        const result=await packageCollection.find().toArray();
        res.send(result);
    })
    app.get('/package/:id',async(req,res)=>{
      const id=req.params.id;
      console.log(id);
      const result=await packageCollection.find({_id : (id)}).toArray();
      console.log(result);
      res.send(result);
    })
    // package collection
    app.get('/carts',async(req,res)=>{
      const email=req.query.email;
      const query={email:email};
      const result=await cartCollection.find(query).toArray();
      res.send(result);
    }) 
    app.post('/carts',async(req,res)=>{
      const cartItem=req.body;
      const result =await cartCollection.insertOne(cartItem);
      res.send(result); 
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
app.get('/', (req, res) => {
  res.send('Tourist Guide')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})