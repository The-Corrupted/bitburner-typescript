import { NS } from '@ns';

export async function main(ns: NS): Promise<void> {
	// Check for depth argument
	const depth = ns.args[0] ?? 30;
	const walker = new NodeWalker(ns, depth-1);
	await walker.walk('home', printNodePadded);
}

const printNodePadded = (ns: NS, node: string, depth: number) => {
	const str = '';
	for (let x=depth;x>0;--x) {
		str += '-';
	}
	str += '>';
	str += node;
	ns.tprintf(str);
}


type WalkerCallback = ((ns: NS, node: string, depth: number) => void);

class NodeWalker {
	private depth: number;
	private ns: Ns;
	constructor(ns: NS, depth?: number) {
		this.ns = ns;
		this.depth = depth ?? 30; 
	}
	
	async walk(start: string, cb: WalkerCallback): Promise<void> {
		if (!this.ns.serverExists(start)) return;
		let depth = 0;
		cb(this.ns, start, depth);
		if (this.depth <= 1) return;
		const hosts = this.ns.scan(start);
		for (const host of hosts) {
			await this.next_node(host, start, cb, depth += 1);
		}
	}

	private async next_node(node, previous_node, cb: WalkerCallback, depth: number): Promise<void> {
		if (depth > this.depth) return;
		cb(this.ns, node, depth);
		const hosts = this.ns.scan(node);
		for (const host of hosts) {
			if (host === previous_node) continue;
			await this.next_node(host, node, cb, depth += 1);
		}
	}
}
