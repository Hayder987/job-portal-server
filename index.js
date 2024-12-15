require('dotenv').config()
const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express()
const port = process.env.PORT || 4000

app.use(cors({
  origin: ['http://localhost:5173', 
  'https://job-portal-527fe.web.app/'],
  credentials:true
}))


app.use(express.json())
app.use(cookieParser());

const verifyToken =(req, res, next)=>{
  const token = req.cookies.token

  if(!token){
    return res.status(401).send({message: 'access Denied'})
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (err, decoded)=>{
    if(err){
      return res.status(401).send({message: 'access Denied'})
    }

    req.user = decoded
    next()

  })

}



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
    const JobsCollection = client.db("Jobs-DB").collection("jobsCollection")
    const applicationCollection = client.db("Jobs-DB").collection("applicationCollection")

    app.post('/jwt', async(req, res)=>{
      const user = req.body

      const token = jwt.sign(user, process.env.ACCESS_TOKEN_KEY, {expiresIn:'5h'})

      res.cookie('token', token,{
        httpOnly: true,
        secure:false
      }).send({status: true})
     
    })


    app.post('/alljobs', async(req, res)=>{
      const body = req.body
      const result = await JobsCollection.insertOne(body)
      res.send(result)
    })

    app.get('/alljobs', async(req, res)=>{
        const result = await JobsCollection.find().toArray()
        res.send(result)
    })

    app.get('/mypost', async(req, res)=>{
      const email = req.query.email
      const query = {hr_email:email}
      const result = await JobsCollection.find(query).toArray()
      res.send(result)
    })

    app.get('/recentJobs', async(req, res)=>{
      const option = {limit: 8}
      const result = await JobsCollection.find({}, option).sort({_id: -1}).toArray()
      res.send(result)
    })

    app.get('/search', async(req, res)=>{
      const {params}= req.query;
      let option = {}
      if(params){
        option = {
          $or: [
            { category: { $regex: params, $options: 'i' } },
            { title: { $regex: params, $options: 'i' } }
          ]
        };
      }
      const result = await JobsCollection.find(option).toArray()
      res.send(result)
    })

    app.get('/job', async(req, res)=>{
      const {id} = req.query
      const filter = { _id: new ObjectId(id)}
      const result = await JobsCollection.findOne(filter)
      res.send(result)
    })

    app.post('/application', async(req, res)=>{
      const body = req.body;
      const result = await applicationCollection.insertOne(body)
      const id = body.jobsId
      const filter = {_id: new ObjectId(id)}
      const job = await JobsCollection.findOne(filter)
      let count = 0;
      if(job.applicationCount){
        count = job.applicationCount + 1
      }
      else{
        count = 1
      }

      const updateDoc = {
        $set: {
          applicationCount: count
        },
      };

      const result2 = await JobsCollection.updateOne(filter, updateDoc)
      res.send(result)

    })

    app.get('/myApplication', verifyToken, async(req, res)=>{
     
      const email = req.query.email;
      const query = {email: email}
      if(req.user.email !== email){
        return res.status(403).send('forbidden')
      }
      const result =await applicationCollection.find(query).toArray()
      res.send(result)
    })

    app.get('/postapplicant', async(req, res)=>{
      const id = req.query.id;
      const query = {jobsId: id}
      const result = await applicationCollection.find(query).toArray()
      res.send(result)
    })

    app.delete('/myApplication/:id', async(req, res)=>{
        const id = req.params.id
        const filter  = {_id: new ObjectId(id)}
        const result = await applicationCollection.deleteOne(filter)
        res.send(result)
    })

    app.patch('/candidate/:id', async(req, res)=>{
      const id = req.params.id
      const body = req.body
      const filter = {_id: new ObjectId(id)}
      const updateDoc = {
        $set: {
           status: body.status
        }
      }

      const result = await applicationCollection.updateOne(filter, updateDoc)
      res.send(result)
    })




   
   

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