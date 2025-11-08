const express=require("express")
const cors=require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const app=express()
const port =process.env.PORT || 3000

//assignment-10
//4Vz2SNpf763jJ8GZ

app.use(cors())
app.use(express.json())

const uri = "mongodb+srv://assignment-10:4Vz2SNpf763jJ8GZ@cluster0.q7tqgdi.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/',(req,res)=>{
    res.send('assignemtn-10 server is running')
})

async function  run(){
    try{
        await client.connect()
        await client.db('admin').command({ping:1})
        console.log("pinged you deployment successfully")
    }
    finally{
        
    }

}
run().catch(console.dir)

app.listen(port,()=>{
    console.log(`simple crud  sever is running on port ${port}`)
})