const express = require('express')
const app = express()
var jwt = require('jsonwebtoken');
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
    const userCollection=client.db("TouristDb").collection("users");
    const storyCollection=client.db("TouristDb").collection("story");
    const bookingCollection=client.db("TouristDb").collection("booking");

    // jwt related api
    app.post('/jwt',async(req,res)=>{
      const user=req.body;
      const token=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'});
      res.send({token});
    })

    // verify token middlewares
    const verifyToken=(req,res,next)=>{
      console.log('inside verify token', req.headers.authorization);
      if(!req.headers.authorization){
        return res.status(401).send({message:'forbidden access'})
      }
      const token=req.headers.authorization.split(' ')[1];
       jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
          if(err){
            return res.status(401).send({message:'unauthorized access'})
          }
          req.decoded=decoded;
          next();
       })
    }
    // verifyAdmin
    const verifyAdmin=async(req,res,next)=>{
      const email=req.decoded.email;
      const query={email:email};
      const user=await userCollection.findOne(query);
      const isAdmin=user?.role==='admin';
      if(!isAdmin){
       return res.status(403).send({message:'forbidden access'});
      }
      next()
   }


  //  user related api
  app.get('/users',verifyToken,verifyAdmin, async(req,res)=>{
    console.log(req.headers);
    const result=await userCollection.find().toArray();
    res.send(result);
})
app.get('/users/admin/:email',verifyToken ,async(req,res)=>{
  const email=req.params.email;
  if(email!==req.decoded.email){
   return res.status(403).send({message:'unauthorized access'})
  }
  const query={email:email};
  const user=await userCollection.findOne(query);
  let admin=false;
  if(user){
   admin=user?.role==='admin';
  }
  res.send({admin})
})


  app.post('/users',async(req,res)=>{
    const user=req.body;
    const query={email : user.email}
    const existingUser=await userCollection.findOne(query);
    if(existingUser){
      return res.send({message:'user already exists',insertedId:null})
    }
    const result=await userCollection.insertOne(user);
    res.send(result)

  })
  // story api
  app.get('/story',async(req,res)=>{
    const result=await storyCollection.find().toArray();
    res.send(result);
})

app.get('/story/:id',async(req,res)=>{
  const id=req.params.id;
  console.log(id);
  const result=await storyCollection.find({_id : (id)}).toArray();
  console.log(result);
  res.send(result);
})

// 
app.patch('/users/admin/:id',async(req,res)=>{
  const id=req.params.id;
  const filter={_id:(id)};
  const updateDoc={
    $set:{
      role:'admin'
    }
  }
  const result=await userCollection.updateOne(filter,updateDoc);
  res.send(result);
})

app.delete('/users/:id',async(req,res)=>{
  const id=req.params.id;
  const query={_id:(id)}
  const result=await userCollection.deleteOne(query);
  res.send(result);
})
// admin route

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
    app.post('/package',async(req,res)=>{
      const id=req.body;
      const result =await packageCollection.insertOne(id);
      console.log(result);
      res.send(result); 
    })
    // Booking
    app.get('/booking',async(req,res)=>{
      const result=await bookingCollection.find().toArray();
      res.send(result);
  })
    app.post('/booking',async(req,res)=>{
      const id=req.body;
      const result =await bookingCollection.insertOne(id);
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
    app.delete('/carts/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id:new ObjectId(id)}
      const result=await cartCollection.deleteOne(query);
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