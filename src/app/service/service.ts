import { Command } from '../models/command';
import { RepositoryMapper } from './repository-mapper';

export const NAME = 'Product State Controller';

export const CHANNEL = {
	IN:'get_state_product',
	OUT:'got_state_product',
};

export const COMMAND = {
  GET:"[Get]",
  FIND:"[Find]",
  ADVANCE_STATE:"[Advance State]",
  GET_STATE:"[Get State]"
};

export const Service = RepositoryMapper;

export const operate = (cmd:Command, sv) => {
  switch (cmd.type) {
      
    case COMMAND.ADVANCE_STATE:
      return sv.advance(cmd);

    default:
      return sv.getChatMediation(cmd);
  }
};