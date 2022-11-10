import { NS } from '@ns';
import { NodeWalker} from 'lib/walker';


export async function main(ns: NS): Promise<void> {
	// Check for depth argument
	const depth = ns.args.includes('-d') ? ns.args[ns.args.indexOf('-d') + 1] as number : 32;
	// Create a new node walker instance
	const walker = new NodeWalker(ns, depth-1);
	const hostname = ns.getHostname();
	// Check info level
	// 0 - Just the path
	// 1 - Hack status
	// 2 - Backdoored
	const info_level = ns.args.includes('-l') ? ns.args[ns.args.indexOf('-l') + 1] as number : 0;
	await walker.list_nodes(hostname, '', 0, info_level);
}
