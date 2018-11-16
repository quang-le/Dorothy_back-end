const express= require('express');
const bodyParser= require('body-parser')
const app=express();

//please secure this
let url = "mongodb://process.env.DB_USER:process.env.DB_PWD@ds063889.mlab.com:63889/dorothytest";
const port = process.env.PORT || 3003;

var myDB;//global var for the DB, not so clean

let mongodb = require ('mongodb').MongoClient;
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

mongodb.connect(url, function(err,db,){
    if (err) throw err;
    myDB=db.db("dorothytest");
    app.listen(port, function(){
        console.log ('listening to '+ port)
    });
})

app.get('/tech-answers/', (req,res,next)=>{
    console.log('request received')
    console.log(req.query)
    
    let paramArray=Object.values(req.query);
    let tags=paramArray.map((param)=>{
        return param;
    })
    console.log(tags);
    myDB.collection('resources').find({tags:{$all:tags}}).toArray(function(err,result){
        if (err) throw err;
        let resultFiltered= result.map((object)=>{
            return {'url':object.url,'description':object.description};
        })
        let preparedData={...resultFiltered}
        // let prepareData={};
        // for(let i=0;i<resultFiltered.length;i++){
        //     prepareData[i]=resultFiltered[i];
        // }
        let dataToSend=JSON.stringify(preparedData);
        console.log(dataToSend);
        return res.send(dataToSend);
    });
    //res.send(req.params);
})

app.get('/', (req,res)=>{
    console.log("welcome");
})