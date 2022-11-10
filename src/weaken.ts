import { NS } from '@ns';

export async function main(ns: NS): Promise<void> {
		if (ns.args.includes('-h')) {
			ns.tprintf('Arguments:');
			ns.tprintf('-h : Displays script help page');
			ns.tprintf('-r : Continue running weaken until the script is killed');
			ns.tprintf('-s : Server to weaken');
			ns.exit();
		}
		let repeat = ns.args.includes('-r') ? true : false;
		// If the server argument is missing or at the end
		// then a server wasn't specified
		const index = ns.args.indexOf('-s');
		if (index === -1 || index === ns.args.length) {
			ns.tprintf('A server must be provided');
			ns.tprintf('e.x: run weaken.js -s neo-net');
			ns.exit();
		}
		const server = ns.args[index+1] as string;

		do {
			await ns.weaken(server);
		} while(repeat);
}
