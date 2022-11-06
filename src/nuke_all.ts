import { NS, Server, Player } from '@ns';

// This script attempts to walk the server tree and gain admin access
// to servers that can be 'hacked'

export async function main(ns: NS): Promise<void> {
	const nuker = new Nuker(ns);
	await nuker.run();
	nuker.print_nuked();
}

class Nuker {
	private ns: NS;
	private hacked: string[] = [];
	private available: string[] = [];
	constructor(ns: NS) {
		this.ns = ns;
		if (this.ns.fileExists('BruteSSH.exe', 'home')) this.available.push('ssh');
		if (this.ns.fileExists('relaySMTP.exe', 'home')) this.available.push('smtp');
		if (this.ns.fileExists('FTPCrack.exe', 'home')) this.available.push('ftp');
		if (this.ns.fileExists('HTTPWorm.exe', 'home')) this.available.push('http');
		if (this.ns.fileExists('SQLInject.exe', 'home')) this.available.push('sql');
	}

	public async run() {
		// Always start at home. Skip home.
		const connected = this.ns.scan('home');
		for (const host of connected) {
			await this.next_node(host, 'home');
		}
	}

	public print_nuked() {
		for (const hacked of this.hacked) {
			this.ns.tprintf("Server: " + hacked + " rooted");
		}
	}

	private async next_node(node: string, previous_node: string) {
		const connected = this.ns.scan(node);
		if(this.root_node(node)) this.hacked.push(node);
		for (const host of connected) {
			if (host === previous_node) continue;
			await this.next_node(host, node);
		}
	}
	
	// Attempt to root the node. Try not to rely on try catch
	// It's slow and not necessary
	private root_node(host: string): boolean {
		const player = this.ns.getPlayer();
		const server = this.ns.getServer(host);
		// Return if server is already nuked
		if (server.hasAdminRights) return false;
		// Return early if the server can't be hacked currently.
		if (player.skills.hacking < server.requiredHackingSkill) return false;
		// Return early if the number of ports needed to hack is more than
		// the players available port hack programs
		if (!this.can_open_required_ports(server, player)) return false;
		// We should be good to go.
		for (const port_attack of this.available) {
			this.open_port(host, port_attack);
		}
		this.ns.nuke(host);
		return true;
	}

	private can_open_required_ports(server: Server, player: Player): boolean {
		// Make sure we have enough port hacks to be able to nuke the server
		if (this.available.length < server.numOpenPortsRequired) return false;
		return true;
	}

	private open_port(host: string, port: string) {
		switch (port) {
			case 'ssh':
				this.ns.brutessh(host);
				break;
			case 'smtp':
				this.ns.relaysmtp(host);
				break;
			case 'ftp':
				this.ns.ftpcrack(host);
				break;
			case 'http':
				this.ns.httpworm(host);
				break;
			case 'sql':
				this.ns.sqlinject(host);
				break;
		}
	}
}
