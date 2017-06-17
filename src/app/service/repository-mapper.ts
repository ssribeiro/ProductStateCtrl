import * as helpers from '../helpers';
import { Talker } from '../talker';
import { Observable } from 'rxjs/Observable';

import { Command } from '../models/command';
import { COMMAND } from './service';

import { AdvanceStateOrder } from './models/advance-state-order';
import { State } from './models/state';

export class RepositoryMapper {

  private talker = new Talker('get_repo_product');
  private allowTransactions = true;
  private transactionsCounter:number = 0;

  constructor() {
  }

  getChatMediation(ask):Observable<any[]> {
    return new Observable<any[]>(obs=>{
      while(!this.allowTransactions){};
      this.transactionsCounter++;
      this.talker.mediateChat(ask, obs, (err)=>{ 
        this.transactionsCounter--;
      });
      return null;
    });
  }

  advance(ask):Observable<any[]> {
    return new Observable<any[]>(obs=>{
      const askState:Command = { type: COMMAND.GET_STATE, payload:null };
      this.talker.getChatMediation(askState, (err)=>{
        if(err!=null)
          helpers.failObs(obs);
      }).subscribe(stateInfo=>{
        if(helpers.isOk(stateInfo))
          this.advanceStateFromTo(stateInfo[0], ask, obs);
        else
          helpers.cancelObs(obs);   
      });
      return null;
    });
  }

  advanceStateFromTo(state:State, ask, obs) {
    const order:AdvanceStateOrder = ask.payload;
    if( state.version == (order.to-1) ) {

      this.pauseTransactions();
      while(this.transactionsCounter>0) { }
      
      this.talker.getChatMediation(ask).subscribe(result=>{
        helpers.okObs(obs, result);
        this.resumeTransactions();
      });
    
    } else
      helpers.failObs(obs);
  }

  pauseTransactions() {
    this.allowTransactions = false;
  }

  resumeTransactions() {
    this.allowTransactions = true;
  }

}