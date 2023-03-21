const fs = require('fs');
const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
// // const redis = require('./redis');
// const redisClient = require('redis');

// var redis = redisClient.createClient({legacyMode: true,url:'redis://:8yJOBod0NpFwoe5954ZIU9Gz@esme.iran.liara.ir:31265/0'});

// redis.on('error', function (err) {
//     console.log('Could not establish a connection with redis. ' + err);
//   });
//   redis.on('connect', function (err) {
//     console.log('Connected to redis successfully');
//   });
// redis.connect()
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const api = "a840a9cf5c9981b48985614aee855a3c";
const url = `https://api.numberland.ir/v2.php/?apikey=${api}&`;
const token = "5954054610:AAGVxlSSg7mrbS2VJubzuybC39MrrYfjuIw";
const bot = new TelegramBot(token, { polling: true });

const numberland = {
  get: async (method)=> {
    console.log(url+method);
    try{
      const server = await axios({
        method: 'GET',
        url: url+method,
        withCredentials: true,
      });
      return server;
    }catch(e){
      console.log(e)
    }
  },
  post: async (method)=> {
    const server = await axios({
      method: 'POST',
      url: url+method,
      withCredentials: true,
    });
    return server;
  }
}
const tcp = {
  ping: async (ip,chat_id) => {
    try{
      let port = ip.indexOf(":") < 1 ? 80 : ip.substring(ip.indexOf(":")+1);
      console.log('TPC->PING:'+ip+':'+port)
      bot.sendMessage(chat_id,`ping -> ${ip}:${port}
please wait...`)
      const server = await axios({
        method: 'POST',
        url: 'https://aqilhex.iran.liara.run/ping',
        data: { ip:ip,port:port },
        withCredentials: true,
      });
      console.log(server.data);
      if(server.data.success){
        bot.sendMessage(chat_id,`Available ✅
HOST: ${server.data.host}
PORT: ${server.data.port}
TIME: ${Math.trunc(server.data.time)}ms`)
      }else{
        bot.sendMessage(chat_id, `Not available or Filtered ❌
HOST: ${ip}
PORT: ${port}
ERROR: ${server.data.error}`);
      }
    }catch(e){
      console.log(e)
    }
  },
  icmp: async (ip,chat_id) => {
    try{
      let port = ip.indexOf(":") < 1 ? 80 : ip.substring(ip.indexOf(":")+1);
      console.log('TPC->PING:'+ip+':'+port)
      bot.sendMessage(chat_id,`ping -> ${ip}
please wait...`)
      const server = await axios({
        method: 'POST',
        url: 'https://aqilhex.iran.liara.run/icmp',
        data: { ip:ip},
        withCredentials: true,
      });
      console.log(server.data);
      if(server.data.ok){
        bot.sendMessage(chat_id,`**IP:** ${ip}
**Transmitted:** ${server.data.transmitted}
**Received:** ${server.data.received},
**Loss:** ${server.data.loss},
**Time:** ${server.data.transmitted},
**Detected:** ${server.data.detected},
**Filtered:** ${server.data.filtered},
**Timeout:** ${server.data.timeout},
**Message:** ${server.data.message}`,{parse_mode:'Markdown'})
      }else{
        bot.sendMessage(chat_id, `Error Occured ❌
**IP:** ${ip}
**Error:** ${server.data.error}`);
      }
    }catch(e){
      console.log(e)
    }
  }
}
const vnumber = {
  start: (chat_id, user_id) => {
    bot.sendMessage(chat_id,`سلام به ربات شماره های مجازی خوش آمدید. با ارسال دستورهای زیر شروع به کار کنید
/services دریافت لیست سرویس ها`)
  },
  services: async (chat_id, user_id) => {
    console.log('services')
    const resp = await numberland.get("method=getservice");
    const services_arr = [];
    resp.data.map((object, i) => {
      services_arr.push({callback_data:`{"action":"service","service_id":${object.id}}`,text:object.name});
    });
    bot.sendMessage(chat_id, "شماره مجازی خود را بسته به نوع سرویس انتخاب کنید تا بدون هیچ مشکلی کد دریافت کنید", {
      reply_markup: {
        inline_keyboard: chunk(services_arr,2),
      },
    });
  },
  service: async (chat_id, message_id, service_id) => {
    console.log('get service')
    const resp = await numberland.get(`method=getinfo&service=${service_id}`);
    try{
      // bot.deleteMessage(chat_id,message_id);
      const services_arr = [];
      for(let i=0;i<50;i++){
        let object = resp.data[i];
        if(object > 0) services_arr.push({callback_data:`{"action":"service","service_id":${object.id}}`,text:object.name});
      }
      // resp.data.map((object, i) => {
      //   if(object.count > 0) services_arr.push({callback_data:`{"action":"service","service_id":${object.id}}`,text:object.name});
      // });
      bot.sendMessage(chat_id, "لیست شماره ها بر اساس کشورهای مختلف", {
        reply_markup: {
          inline_keyboard: chunk(services_arr,4),
        },
      }); 
    }catch(e){
      console.log(e)
    }
  }
};
bot.on("message", async (msg) => {
  console.log(msg);
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const msgId = msg.message_id;
  const text = msg.text;
  const is_forum = msg.chat.is_forum === undefined ? false : msg.chat.is_forum;
  // 676937996
  if(text === '/start') vnumber.start(chatId, userId);
  else if (text === '/services') vnumber.services(chatId, msgId);
  else if (text.substring(0,5) === '/ping') tcp.ping(text.substring(6),chatId);
  else if (text.substring(0,5) === '/icmp') tcp.icmp(text.substring(6),chatId);
});
bot.on("callback_query", async (data) => {
  const msg = data.message;
  try{
    const ev = JSON.parse(data.data);
    console.log(ev)
    if(ev.action === 'service') {
      console.log(ev.service_id)
      vnumber.service(msg.chat.id, msg.message_id,ev.service_id)
    }
  }catch(e){
    bot.sendMessage(msg.chat.id,e?.message)
  }
});

app.listen(port, () => console.log(`listening on port ${port}!`))

function random(min,max) {
  return Math.floor((Math.random())*(max-min+1))+min;
}
const chunk = (arr, size) =>{
  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );
}