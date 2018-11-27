'use strict';
const https = require('https');
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Text, Card, Suggestion} = require('dialogflow-fulfillment');
const axios=require('axios');
const fetch=require('node-fetch');

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


  //START HERE

  function extractTags(contextParameter){
    let paramsArray=[];
    if (typeof contextParameter==='object'){
      paramsArray=contextParameter.map((param)=>{
        return param
      })
    }
    else if(typeof contextParameter==='string'){
      paramsArray.push(contextParameter)
    }
    return paramsArray
  }

  function createTagsArray(context){
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
    return tagsArray;
  }

  function generateGetRequest(tagsArray){
    let stringRequest= "/tech-answers?";
    stringRequest=stringRequest.concat("0="+tagsArray[0]);
    for (let i=1;i<tagsArray.length;i++){
      stringRequest=stringRequest.concat("&"+i+"="+tagsArray[i]);
    }
    return stringRequest;
  }

  function generateFullGetRequestUrl(url,string){
    let getReq=url.concat(string);
    console.log(getReq);
    return getReq
  }

  async function UserAsksTech(agent){
    let currentContext=(agent.context.get('useraskedtech'));
    let queryTagsArray=createTagsArray(currentContext.parameters);
    let getRequest=generateGetRequest(queryTagsArray)
    let requestFullUrl=generateFullGetRequestUrl('https://dorothycares.ovh/resources',getRequest);
    const response= await fetch(requestFullUrl, {
      method:'get',
      headers:{'Content-Type': 'application/json'},
    });
    const body=await response.json();          //.json() needed to have usable info
    const answer=JSON.stringify(body);// re-stringify so DialogFlow can read it
    agent.add(answer);
  }
  //END HERE  

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
  //intentMap.set('UserAsksDorotinder', UserAsksDorotinder);
  // intentMap.set('<INTENT_NAME_HERE>', yourFunctionHandler);
  // intentMap.set('<INTENT_NAME_HERE>', googleAssistantHandler);
  agent.handleRequest(intentMap);
});