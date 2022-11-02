import { NS, Server } from '@ns';

// This script attempts to walk the server tree and gain admin access
// to servers that can be 'hacked'

export async function main(ns: NS): Promise<void> {
	const nuker = new Nuker(ns);
	await nuker.run();
	nuker.print_nuked();
}

class Nuker {
	private available_hacks: Set<string> = new Set();
	private ns: NS;
	private hacked: string[] = [];

	constructor(ns: NS) {
		if (ns.fileExists('BruteSSH.exe', 'home')) this.available_hacks.add('ssh');
		if (ns.fileExists('relaySMTP.exe', 'home')) this.available_hacks.add('smtp');
		if (ns.fileExists('FTPCrack.exe', 'home')) this.available_hacks.add('ftp');
		if (ns.fileExists('HTTPWorm.exe', 'home')) this.available_hacks.add('http');
		if (ns.fileExists('SQLInject.exe', 'home')) this.available_hacks.add('sql');
		this.ns = ns;
	}

	async run() {
		const current_node = this.ns.getHostname();
		await this.node_next(current_node, '');
	}

	print_nuked() {
		if (this.hacked.length < 1) this.ns.tprintf('No server rooted');
		for (const server of this.hacked) {
			this.ns.tprintf('Server: ' + server + ' rooted');
		}
	}

	private async node_next(node: string, previous_node: string) {
		if (this.root_node(node)) this.hacked.push(node);
		const connected_nodes = this.ns.scan(node);
		for (const next_node of connected_nodes) {
			if (next_node === previous_node) continue;
			await this.node_next(next_node, node);
		}
	}

	private root_node(node: string): boolean {
		const player = this.ns.getPlayer();
		const server = this.ns.getServer(node);
		if (server.hasAdminRights) return false;
		if (player.skills.hacking < server.requiredHackingSkill) return false;
		if (server.numOpenPortsRequired > this.available_hacks.size) return false;
		// We should be able to hack the server. Get list of unopened ports
		// and start opening stuff
		const ports = this.get_unopened_ports(server);
		for (const item in ports.values()) {
			this.open_port(item, node);
		}
		// We should be ready to nuke now.
		this.ns.nuke(node);
		return true;	
	}

	private get_unopened_ports(host: Server): Set<string> {
		const ports: Set<string> = new Set();
		if (!host.sshPortOpen && this.available_hacks.has('ssh')) ports.add('ssh');
		if (!host.ftpPortOpen && this.available_hacks.has('ftp')) ports.add('ftp');
		if (!host.smtpPortOpen && this.available_hacks.has('smtp')) ports.add('smtp');
		if (!host.httpPortOpen && this.available_hacks.has('http')) ports.add('http');
		if (!host.sqlPortOpen && this.available_hacks.has('sql')) ports.add('sql');
		return ports;
	}

	private open_port(port_type: string, node: string) {
		switch(port_type) {
			case 'ssh':
				this.ns.brutessh(node);
				break;
			case 'ftp':
				this.ns.ftpcrack(node);
				break;
			case 'smtp':
				this.ns.relaysmtp(node);
				break;
			case 'http':
				this.ns.httpworm(node);
				break;
			case 'sql':
				this.ns.sqlinject(node);
				break;
			default:
				break;
		}
	}

}
