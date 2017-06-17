import { Command } from '../../models/command';

export interface AdvanceStateOrder {
	to:number;
	commands:Command[];
}