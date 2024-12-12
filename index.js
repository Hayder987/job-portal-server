require('dotenv').config()
const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors')
const app = express()
const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jheyv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
   
   
   

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  
  }
}
run().catch(console.dir);



app.get('/', (req, res)=>{
    res.send('hello World')
})

app.listen(port, ()=>{
    console.log(`Server Is Running: ${port}`)
})