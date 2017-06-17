import * as helpers from './helpers';
import * as redis from 'redis';
import * as SERVICE from './service/service';
import { Observable } from 'rxjs/Observable';

import { CHANNEL } from './service/service';

const TALKER_TIMEOUT = 10000;

export class Talker {

  private chatTalker = redis.createClient();
  private chatListener;
  
  private listenersWaiting:any[] = [];
  
  private toGet:string;
  private fromGot:string;

  timeout:number = TALKER_TIMEOUT;

  constructor(toGet=null, fromGot:string=null) {
    if(toGet==null) {
      this.toGet = CHANNEL.OUT;
      this.fromGot = CHANNEL.IN;
    } else {
      this.toGet = toGet;
      if(fromGot==null)
        this.fromGot = 'go'+this.toGet.substring(2,this.toGet.length);
      else
        this.fromGot = this.fromGot;
    }
    this.restartChat();
  }

  setTimeout(t:number) {
    this.timeout = t;
  }

  restartChat() {
    if(this.chatListener!=null) 
      this.chatListener.quit();
    this.chatListener = redis.createClient();
    this.chatListener.on('message', (channel, message) => {
      const Msg = JSON.parse(message, helpers.reviverJSON);
      this.listenersWaiting.forEach(listener=> listener(Msg));
    });
    this.chatListener.subscribe(this.fromGot);
  }

  ask(msg:any) {
    this.chatTalker.publish(this.toGet, JSON.stringify(msg, helpers.replacerJSON));
  }

  askTo(msg:any, toGet:string) {
    this.toGet = toGet;
    this.ask(msg);
  }

  listen(func) {
    this.listenersWaiting.push(func);
  }

  listenFrom(func, fromGot:string) {
    this.fromGot = fromGot;
    this.restartChat();
    this.listen(func);
  }

  understood(func, callback=null) {
    this.listenersWaiting = this.listenersWaiting.filter(list=>list!=func);
    if(callback!=null)
      callback(null);
  }

  failure(func, callback=null) {
    this.listenersWaiting = this.listenersWaiting.filter(list=>list!=func);
    if(callback!=null)
      callback('timeout');
  }

  mediateChat(msg, obs, callback=null) {
    this.ask(msg);
    this.putAnsherForIn(msg, obs, callback);
  }

  putAnsherForIn(ask, obs, callback=null) {
    let done:boolean = false;
    const soDo = (msg)=>{
      if(msg.type==ask.type) {
        if( JSON.stringify(msg.payload) == JSON.stringify(ask.payload) ) {
          done = true;
          this.understood(soDo, callback);
          helpers.okObs(obs, msg.data);
        }
      }
    };
    this.listen(soDo);
    setTimeout(()=>{
      if(!done) {
        this.failure(soDo, callback);
        helpers.failObs(obs);
      }
    }, this.timeout);
  }

  getChatMediation(ask, callback=null):Observable<any[]> {
    return new Observable<any[]>(obs=>{
      this.mediateChat(ask, obs, callback);
      return null;
    });
  }

}