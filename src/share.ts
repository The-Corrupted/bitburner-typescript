import { NS } from '@ns';

export async function main(ns: NS): Promise<void> {
	do {
		await ns.share();
	} while(true)
}
