const express= require('express');
const bodyParser= require('body-parser')
const app=express();
const dotenv=require('dotenv').config();

//please secure this
let url = "mongodb://sonnyboy:lovelace2@ds063889.mlab.com:63889/dorothytest";
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
    let userTags=paramArray.map((param)=>{
        return param;
    })
    console.log(userTags);
    
    //hard match with all tags provided by user. 
    // myDB.collection('resources').find({tags:{$all:tags}}).toArray(function(err,result){
    //     if (err) throw err;
    //     let resultFiltered= result.map((object)=>{
    //         return {'url':object.url,'description':object.description};
    //     })
    //     let preparedData={...resultFiltered}
    //     let dataToSend=JSON.stringify(preparedData);
    //     console.log(dataToSend);
    //     return res.send(dataToSend);
    // });
    //Hard match end
    //Match scoring found on SO
    var sortedResults=myDB.collection('resources').aggregate([
        {$unwind:'$tags'},
        {$match:{tags:{$in:userTags}}},
        {$group:{_id:'$_id',count:{$sum:1}}},
        {$project:{_id:1,url:1,description:1,count:1,score:{$divide:['$count',userTags.length]}}},
        {$sort:{score:-1}}
    ]);
    console.log("sortedResults",sortedResults);
    let resultID=sortedResults
        .toArray(function (err, result){
            if (err) throw err;
            let resultFiltered= result.map((object)=>{
                return {'url':object.url,'description':object.description,'match':object.score, 'id':object._id};
            })
            let data={...resultFiltered}
            console.log("data ID: ",data);
            return data;
        })
        .then(data=>data.map(linkID=>{
            if (linkID>0){
                return linkID
            }
        }))
        //add db.find here
 
})

app.get('/', (req,res)=>{
    console.log("welcome");
    res.send("hello world");
})

// let sortedResults=db.collection('resources').aggregate([
//     {$unwind:'$tags'},
//     {$match:{tags:{$in:tags}}},
//     {$group:{_id:'$_id',count:{$sum:1}}},
//     {$project:{_id:1,count:1,score:{$divide:['$count',tags.length]}}},
//     {$sort:$score=-1}
// ]);