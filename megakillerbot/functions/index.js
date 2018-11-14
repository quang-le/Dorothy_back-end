'use strict';
const https = require('https');
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Text, Card, Suggestion} = require('dialogflow-fulfillment');

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  function welcome (agent) {
    https.get('https://dorothycares.ovh/node-api/ressources/php', (res) =>{
        console.log(res);
        });
    agent.add(`cornichon`);
  }

  function fallback (agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  function UserAsksTech(agent){
    debugger;
    let sessionsVar=agent.context.get('sessions-var');
    let currentContext=(agent.context.get('useraskedtech'));
    console.log(currentContext, sessionsVar);
    agent.add("Wait, I'm looking in db for appropriate resource");
    let answerRaw=sendGETReq('https://localhost:3003',prepareStringForGETReq(createTagsArray(currentContext.parameters)));
    console.log('answerRaw:',answerRaw);
    //let answer=JSON.parse(answerRaw);
    //console.log(answer);
    //agent.add(answer);
    agent.add("check the console");

    //This code in case output contexts get lost by using webhook
    // agent.context.set({
    //  "name":currentContext.name,
    //  "lifespan": currentContext.lifespan,
    //  "parameters":currentContext.parameters
    // })
    // agent.context.set({
    //   "name":sessionsVar.name,
    //   "lifespan": sessionsVar.lifespan,
    //   "parameters":sessionsVar.parameters
    // })  
  }

  function extractTags(contextParameter){
    let paramsArray=[];
    if (typeof contextParameter==='object'){
      console.log('extract array:',contextParameter)
      paramsArray=contextParameter.map((param)=>{
        return param
      })
    }
    else if(typeof contextParameter==='string'){
      console.log('extract string:',contextParameter)
      paramsArray.push(contextParameter)
    }
    console.log('paramsArray:',paramsArray);
    return paramsArray
  }

  function createTagsArray(context){
    console.log("context", context, "context.OS",context.OS, "tech:",context.Technologies,"topic:",context.CodeTopic);
    console.log('extracted tech:', extractTags(context.Technologies));
    console.log('extracted OS:',extractTags(context.OS));
    let tagsArray=[];
    if (context.Technologies){
      tagsArray.push(extractTags(context.Technologies))
      };
    if (context.CodeTopic){
      tagsArray.push(extractTags(context.CodeTopic));``
    }
    if (context.OS){
    tagsArray.push(extractTags(context.OS))
    };

    //Refactoring to test out
    // tagsArray=keys.map((k)=>{
    //   return extractTags(context.k);
    // })
    return tagsArray;
  }

  function prepareStringForGETReq(tagsArray){
    let stringRequest= "/tech-answers?";
    console.log(tagsArray);
    stringRequest=stringRequest.concat("0="+tagsArray[0]);
    for (let i=1;i<tagsArray.length;i++){
      stringRequest=stringRequest.concat("&"+i+"="+tagsArray[i]);
    }
    console.log(stringRequest);
    return stringRequest;
  }

  function sendGETReq(url,string){
    https.get((url+string), (res) =>{
      console.log(res);
      return res;
      });
  }

  

   // Uncomment and edit to make your own intent handler
   // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
   // below to get this function to be run when a Dialogflow intent is matched
   function yourFunctionHandler(agent) {
     agent.add(`This message is from Dialogflow's Cloud Functions for Firebase inline editor!`);
     agent.add(new Card({
         title: `Title: this is a card title`,
         imageUrl: 'https://dialogflow.com/images/api_home_laptop.svg',
         text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
         buttonText: 'This is a button',
         buttonUrl: 'https://docs.dialogflow.com/'
       })
     );
     agent.add(new Suggestion(`Quick Reply`));
     agent.add(new Suggestion(`Suggestion`));
     agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
   }

   // Uncomment and edit to make your own Google Assistant intent handler
   // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
   // below to get this function to be run when a Dialogflow intent is matched
   function googleAssistantHandler(agent) {
     let conv = agent.conv(); // Get Actions on Google library conv instance
     conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
     agent.add(conv); // Add Actions on Google library responses to your agent's response
   }

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('UserAsksTech',UserAsksTech);
  // intentMap.set('<INTENT_NAME_HERE>', yourFunctionHandler);
  // intentMap.set('<INTENT_NAME_HERE>', googleAssistantHandler);
  agent.handleRequest(intentMap);
});