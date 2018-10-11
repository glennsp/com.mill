'use strict';

const Homey = require('homey');
const Mill = require('../../lib/mill');

class MillApp extends Homey.App {

	onInit() {
		this.mill = new Mill();

		let username = Homey.ManagerSettings.get('username');
		let password = Homey.ManagerSettings.get('password');

		if(username && password) {
			this.authenticate(username, password).catch(e=>{console.log('error', e)});
		}

		this.log(`${Homey.manifest.id} is running..`);
	}

	async authenticate(username, password) {
		this.user = await this.mill.login(username, password);
		//this.user = await this.mill.login('glenn.pedersen@gmail.com', 'picTe7-cikhip-dobdim');
	}
}

module.exports = MillApp;
