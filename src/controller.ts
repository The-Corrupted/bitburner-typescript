import { NS, Formulas, Server, Player } from '@ns';

const RAM_PER_SCRIPT = 1.7;

// Controller for proto-batch hack. This requires that the player have the formulas
// executable ( it is possible to have a controller that does not use formulas
// but it would require a lot of ram and tons of additional code. It gets very
// difficult to manage very quickly.

export async function main(ns: NS): Promise<void> {
	if (ns.args.includes('-h')) {
		
	}
}

// TODO: Augement to be a batch (HWGW) algorithm.
// Proto batch works but the 

class Controller {
	private _player: Player;
	private _ns: NS;
	private _host: string;
	private _server: Server;
	private _target_percent: number;
	private _available_ram: number;
	private _cores: number;
	private _maximum_threads: number;

	constructor(ns: NS, host: string, cores: number, dp?: number) {
		const server_host = ns.getHostname();
		this._ns = ns;
		this._player = ns.getPlayer();
		this._server = ns.getServer(host);
		this._host = host ?? '';
		this._target_percent = (dp ?? 10) / 100;
		this._available_ram = ns.getServerMaxRam(server_host) - ns.getScriptRam('controller.js', server_host);
		this._cores = cores;
		this._maximum_threads = (this._available_ram / RAM_PER_SCRIPT) - 1;

	}

	// It is assumed the proper preparations were made before running
	// I.e. The server has been weakened and grown to its minimum/maximum values
	// respectively.
	public run() {
		if (!this._ns.fileExists('Formulas.exe', 'home')) {
			this._ns.tprintf('Controller relies on formulas. Ensure you own it before');
			this._ns.tprintf('running this program');
			this._ns.exit();
		}
		this.set_approximate(); 
	}

	// Check and make sure enough resources are available to hack, grow and weaken
	// the desired percent. If not then set the maximum percent that doesn't 
	// exceed available ram.
	private set_approximate() {
		const hack_percent_per_thread = this._ns.formulas.hacking.hackPercent(this._server, this._player);
		let x = hack_percent_per_thread;
		let ram = RAM_PER_SCRIPT;
		while (x < this._target_percent) {
			ram += RAM_PER_SCRIPT;
			if ( ram > this._available_ram ) {
				break;
			}
			x += hack_percent_per_thread;
		}
		this._target_percent = x;
		// Calculate the amount of ram needed to regrow the server to 100%
		const max_money = this._ns.getServerMaxMoney(this._host);
		const money_after_hack = max_money - (max_money * x);
		ram = RAM_PER_SCRIPT;
	
	}
}

