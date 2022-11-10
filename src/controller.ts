import { NS, Formulas, Server, Player } from '@ns';

// Controller for batch hack. This requires that the player have the formulas
// executable ( it is possible to have a controller that does not use formulas
// but it would require a lot of ram and tons of additional code. It gets very
// difficult to manage very quickly.

export async function main(ns: NS): Promise<void> {

}

class Controller {
	private player: Player;
	private ns: NS;
	private server: Server;
	private drain_percent: number;

	constructor(ns: NS, host: string, drain_percent?: number) {
		this.ns = ns;
		this.player = ns.getPlayer();
		this.server = ns.getServer(host);
		this.drain_percent = drain_percent ?? 10;
	}
}
