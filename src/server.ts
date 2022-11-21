import { NS } from '@ns';
import { Ok, Err, Result } from './lib/error';

export async function main(ns: NS): Promise<void> {
	// Check for server operation type. 
	// Will search in the following order. If two or more
	// of the arguments are provided, the first will be selected
	// and the rest will be ignored.
	// -u : upgrade existing server ram
	// -b : buy new server
	// -r : run script on server
	
	// Exit at the end of each if statement
	// to ensure the user doesn't try to (potentially)
	// incorrectly chain multiple server operations together
	if (ns.args.includes('-u')) {
		await upgrade_server(ns);
		ns.exit();
	}
	if (ns.args.includes('-b')) {
		await buy_server(ns);
		ns.exit();
	}
	if (ns.args.includes('-d')) {
		await delete_server(ns);
		ns.exit();
	}
	
	base_help(ns);
}

const upgrade_server = async (ns: NS): Promise<void> => {
	if (ns.args.includes('-h')) {
		upgrade_help(ns);
		return;
	}
		
	const result = validate_purchase_inputs(ns);
	if (!result.ok) {
		ns.tprintf(result.error);
		return;
	}

	const values = result.value;
	const server = values[0];
	const ram = values[1];
	const cost = ns.getPurchasedServerUpgradeCost(server, ram);
	const player_cash = ns.getPlayer().money;
	
	if (cost > player_cash) {
		ns.tprintf('Unable to purchase. Player doesn\'t have enough money');
		ns.tprintf('Cost: %s\nPlayer cash: %s', cost, player_cash);
		return;
	}

	// Make sure server exists
	if (!server_exists(ns, server)) {
		ns.tprintf('Server: %s doesn\'t exist', server);
		return;
	}

	ns.upgradePurchasedServer(server, ram);
	ns.toast('Upgraded ' + server + ' to ' + ram.toString(), 'success', 8000);
}

const buy_server = async (ns: NS): Promise<void> => {
	if (ns.args.includes('-h')) {
		buy_help(ns);
		return;
	}

	const result = validate_purchase_inputs(ns);
	if (!result.ok) {
		ns.tprintf(result.error);
		return;
	}

	const value = result.value;
	const server = value[0];
	const ram = value[1];

	const cost = ns.getPurchasedServerCost(ram);
	const player_cash = ns.getPlayer().money;
	if (cost > player_cash) {
		ns.tprintf('Unable to purchase. Player doesn\'t have enough money');
		ns.tprintf('Cost: %s\nPlayer cash: %s', cost, player_cash);
		return;
	}

	if (server_exists(ns, server)) {
		const input = await ns.prompt('Server exists. Continue anyways?', {type: 'select', choices: ['Yes', 'No']});
		if (!input) {
			ns.tprintf('Aborting');
			return;
		}
	}

	ns.purchaseServer(server, ram);
	ns.toast('Bought: ' + server, 'success', 8000);
}

const delete_server = async (ns: NS): Promise<void> => {
	if (ns.args.includes('-h')) {
		delete_help(ns);
		return;
	}
	
	const server_index = ns.args.indexOf('-s');
	if (server_index === -1 || server_index === ns.args.length) {
		ns.tprintf('A server must be selected');
		return;
	}
	
	const server = ns.args[server_index + 1];
	if (typeof server !== 'string') {
		ns.tprintf('The server name must be a string');
		return;
	}

	if (!server_exists(ns, server)) {
		ns.tprintf('Server doesn\'t exist. Doing nothing');
		return;
	}

	const input = await ns.prompt('Are you sure you want to delete ' + server,
							{type: 'boolean', choices: ['Yes', 'No']});
	if (!input) {
		ns.tprintf('Aborted');
		return;
	}

	ns.deleteServer(server);
	ns.toast('Deleted: ' + server, 'success', 8000);
}

const server_exists = (ns: NS, server: string): boolean => {
	const purchased = ns.getPurchasedServers();
	if (purchased.includes(server)) {
		return true;
	}
	return false;
}

const validate_purchase_inputs = (ns: NS): Result<[name: string, ram: number]> => {
	const index_server = ns.args.indexOf('-s');
	const index_ram_amount = ns.args.indexOf('-r');
	// Make sure arguments exist and that they are not last in the args list 
	if (index_server === -1 || index_server === ns.args.length) {
		return Err('Server index invalid');
	}
	if (index_ram_amount === -1 || index_ram_amount === ns.args.length) {
		return Err('Upgrade index invalid');
	}
	// Make sure the arguments haven't been chained
	if (index_ram_amount + 1 === index_server || index_ram_amount - 1 === index_server) {
		return Err('Argument chain detected');
	}

	// The server argument should be a string. Anything else
	// should be considered a user error.
	const server = ns.args[index_server + 1];
	if (typeof server !== 'string') {
		return Err('The server name should be a string');
	}
	// Argument type can be a boolean, number or string.
	// The upgrade amount should either be a string or 
	// a number. If it is a boolean then that is a user error
	// and we should stop and warn.
	const ram_amount = ns.args[index_ram_amount + 1];
	if (typeof ram_amount === 'boolean') {
		return Err('The upgrade amount may not be a boolean');
	}
	const ram = typeof ram_amount === 'string' ? calculate_ram(ram_amount) : ram_amount;
	return Ok([server, ram]);
}

const calculate_ram = (ram: string): number => {
	// If ram ends with terabyte then assume terabyte
	const intValue = parseInt(ram);
	if (ram.endsWith('t')) {
		return intValue * 1024;
	}
	// If t or g aren't present at the end, then assume ram is just
	return intValue;
}

const base_help = (ns: NS): void => {
	ns.tprintf('Arguments:');
	ns.tprintf(' -u: upgrade server');
	ns.tprintf(' -b: buy server');
	ns.tprintf(' -r: run script on server');
}

const upgrade_help = (ns: NS): void => {
	ns.tprintf('Arguments:');
	ns.tprintf(' -s: server to upgrade');
	ns.tprintf(' -r: new ram amount');
}

const buy_help = (ns: NS): void => {
	ns.tprintf('Arguments:');
	ns.tprintf(' -s: server to buy');
	ns.tprintf(' -r: ram amount');
}

const delete_help = (ns: NS): void => {
	ns.tprintf('Arguments:');
	ns.tprintf(' -s: server to delete');
}


