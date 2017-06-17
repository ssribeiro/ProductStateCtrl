import * as helpers from './helpers';
import * as redis from 'redis';
import * as SERVICE from './service/service';

import { Commanded } from './models/commanded';

export class Publisher {
	
  private evt = redis.createClient();

  constructor() { }

  publish(msg:string) {
    //console.log("Publishing: ", msg);
    this.evt.publish(SERVICE.CHANNEL.OUT, msg);
  }

  publishCommanded(cmd:Commanded) {
  	this.publish(JSON.stringify(cmd, helpers.replacerJSON));
  }

}