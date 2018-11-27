const express= require('express');
const bodyParser= require('body-parser')
const app=express();
const dotenv=require('dotenv').config();

//please secure this
//uncomment when DB address onserver is solved
//let url = "mongodb://localhost:27017/dorothycares";
//MLAB connection not suitable for prod
let url='mongodb://sonnyboy:lovelace2@ds063889.mlab.com:63889/dorothytest';

const port = process.env.PORT || 5000;

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
    
    let paramArray=Object.values(req.query);
    let userTags=paramArray.map((param)=>{
        return param;
    })

    var sortedResults=myDB.collection('resources').aggregate([
        {$unwind:'$tags'},
        {$match:{tags:{$in:userTags}}},
        {$group:{_id:'$_id',count:{$sum:1}}},
        {$project:{_id:1,count:1,score:{$divide:['$count',userTags.length]}}},
        {$sort:{score:-1}}
    ]);

    let resultID=new Promise (function (resolve,reject){
        sortedResults
        .toArray(function (err, result){
            if (err) {
                return reject (err);
            }
            let resultFiltered= result.map((object)=>{
                return {'match':object.score, '_id':object._id};
            })
            return resolve(resultFiltered);
        })})
        .then(data=>{   
            let dataForFrontEnd=[];
            let linkIDs=data.map((link)=>{
                return link._id
            })
            console.log("link_id:",linkIDs);
                myDB.collection('resources')
                    .find({_id:{$in:linkIDs}})
                    .toArray(function(err,result){
                        if (err) throw err;
                        dataForFrontEnd.push(result);
                        dataToFrontEnd=JSON.stringify(dataForFrontEnd);
                        return res.send(dataForFrontEnd)
                    })
            })
        .catch(err=>console.log(err))
    })

app.get('/', (req,res)=>{
    res.send("hello world");
})