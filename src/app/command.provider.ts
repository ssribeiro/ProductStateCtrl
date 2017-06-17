import * as helpers from './helpers';

import { Command } from './models/command';
import { Commanded } from './models/commanded';

export function generate(cmdRaw:string) {
	let cmd;
	try {
		cmd = JSON.parse(cmdRaw, helpers.reviverJSON);
	} catch(e) {
		return null;
	}
	return <Command> cmd;
}

export function mapToDone(cmd:Command, data:any[] = null):Commanded {
	return Object.assign({}, cmd, { data });
}