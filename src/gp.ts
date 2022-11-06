import { NS } from '@ns';
import { NodeWalker } from 'lib/walker';

type args = boolean | number | string;

export async function main(ns: NS): Promise<void> {	
	const log_level = ns.args.includes('-l') ? ns.args[ns.args.indexOf('-l') + 1] as number : 0;
	const server = ns.args.includes('-s') ? ns.args[ns.args.indexOf('-s') + 1] as string : '';
	const depth = ns.args.includes('-d') ? ns.args[ns.args.indexOf('-d') + 1] as number : 32;

	if (!ns.serverExists(server)) {
		ns.tprintf('Server ' + server + ' doesn\'t exist');
		ns.exit();
	}
	const walker = new NodeWalker(ns, depth ?? 32);
	const hostname: string = ns.getHostname();
	const path = await walker.search(hostname, '', server, 0); 
	if (path[0] === false) {
		ns.tprintf('Unable to find server: ' + server);
		ns.exit();
	}
	for (const node of path[1]) {
		walker.print_node(node, log_level ?? 0);
	}
}
