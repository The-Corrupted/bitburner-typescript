import { NS, Server } from '@ns';

type Node = {
	hostname: string,
	server: Server,
	depth: number,
}


export class NodeWalker {
	protected depth: number;
	protected ns: NS;
	constructor(ns: NS, log_level: number, depth?: number) {
		this.ns = ns;
		// Cap depth to be less than 64
		let d = depth ?? 30;
		this.depth = d >= 64 ? 63 : d;
	}
	
	public async search(current_node: string, previous_node: string, search_node: string, depth: number): Promise<[boolean, Node[]]> {
		if (depth >= this.depth) return [false, []]; 
		const node: Node = {hostname: current_node, server: this.ns.getServer(current_node), depth: depth};
		let array: Node[] = [node];
		const connected = this.ns.scan(current_node);
		if (connected.includes(search_node)) {
			const final_node = {hostname: search_node, server: this.ns.getServer(search_node), depth: depth + 1};

			array.push(final_node);
			return [true, array];
		}
		for (const host of connected) {
			if (host === previous_node) continue;
			const result = await this.search(host, current_node, search_node, depth + 1);
			if (result[0]) {
				array = array.concat(result[1]);
				return [true, array];
			}
		}
		return [false, []];
	}

	public async list_nodes(current_node: string, previous_node: string, depth: number, log_level: number): Promise<void> {
		if (depth >= this.depth) return;
		// Print node with log level
		this.print_node({hostname: current_node, server: this.ns.getServer(current_node), depth: depth}, log_level);
		const connected = this.ns.scan(current_node);
		for (const host of connected) {
			if (host === previous_node) continue;
			await this.list_nodes(host, current_node, depth+1, log_level);
		}
	}

	public print_node(node: Node, log_level: number) {

		let str = padding(node.depth) + node.hostname;
		switch(log_level) {
			case 0:
				this.ns.tprintf(str);
				break;
			case 1:
				const hack_status = node.server.hasAdminRights ? 'Hacked' : 'Not Hacked';
				this.ns.tprintf(str + ' (' + hack_status + ')');
				break;
			case 2:
				const h_status = node.server.hasAdminRights ? 'Hacked' : 'Not Hacked';
				const backdoor = node.server.backdoorInstalled ? 'Backdoored' : 'No Backdoor';
				this.ns.tprintf(str + ' (' + h_status + '|' + backdoor + ')');
				break;
			default:
				this.ns.tprintf('Improper level value: ' + log_level);
		}
	}
}

const padding = (x: number): string => {
	let str = '';
	for (x; x > 0; --x) {
		str += '-';
	}
	str += '>';
	return str;
}
