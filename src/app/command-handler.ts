import { Observable } from 'rxjs/Observable';

import * as CommandProvider from './command.provider';
import { Command } from './models/command';

import { COMMAND, Service, operate } from './service/service';
import { Publisher } from './publisher';

export class CommandHandler {

  private publisher = new Publisher();
  private service = new Service();

  constructor() { }

  handle(cmd) {
    const cmdParsed = CommandProvider.generate(cmd);
    if(cmdParsed==null) {
      console.log("Not JSON");
      return;
    }
    this.execute(cmdParsed);
  }

  execute(cmd:Command) {
    const data$:Observable<any[]> = operate(cmd, this.service);
    if(data$!=null) {
      const sub = data$.subscribe(data=>{
        if(data!=null)
          this.publisher.publishCommanded(CommandProvider.mapToDone(cmd, data));
        sub.unsubscribe();
      });
    }
  }

}
