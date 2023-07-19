
'use strict';

const path = require('path');

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const { buildWallet, buildCCPOrg1 } = require('./AppUtil');

const config = require('../../config.json');
const walletPath = path.join(config.walletPath)

exports.buildConnection = async () => {

	try {
		const ccp = buildCCPOrg1();
		const caClient = this.buildCAClient(FabricCAServices, ccp, config.ca.hostname);
		const wallet = await buildWallet(Wallets, walletPath);

		await this.enrollAdmin(caClient, wallet, config.org1.msp);
		await this.registerAndEnrollUser(caClient, ccp, wallet, config.org1.msp, config.org1.userId, config.org1.affiliation);

		const gateway = new Gateway();
		await gateway.connect(ccp, {
			wallet,
			identity: config.org1.userId,
			discovery: { enabled: true, asLocalhost: true }
		});

		const network = await gateway.getNetwork(config.channelName);
		const contract = network.getContract(config.chaincodeName);

		return { contract, gateway }
	} catch (error) {
		console.log(error.message);
	}
}

exports.buildCAClient = (FabricCAServices, ccp, caHostName) => {
	// Create a new CA client for interacting with the CA.
	const caInfo = ccp.certificateAuthorities[caHostName];
	const caTLSCACerts = caInfo.tlsCACerts.pem;
	const caClient = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

	console.log(`Built a CA Client named ${caInfo.caName}`);

	return caClient;
};

exports.enrollAdmin = async (caClient, wallet, orgMspId) => {
	console.log('================Enroll Admin================')
	try {
		// Check to see if we've already enrolled the admin user.
		const identity = await wallet.get(config.admin.userId);
		if (identity) {
			console.log('An identity for the admin user already exists in the wallet');
			return;
		}
		// Enroll the admin user, and import the new identity into the wallet.
		const enrollment = await caClient.enroll({ enrollmentID: config.admin.userId, enrollmentSecret: config.admin.password });
		const x509Identity = {
			credentials: {
				certificate: enrollment.certificate,
				privateKey: enrollment.key.toBytes(),
			},
			mspId: orgMspId,
			type: 'X.509',
		};

		await wallet.put(config.admin.userId, x509Identity);
		console.log('Successfully enrolled admin user and imported it into the wallet');
	} catch (error) {
		console.error(error)
		console.error(`Failed to enroll admin user : ${error}`);
	}
};

exports.registerAndEnrollUser = async (caClient, ccp, wallet, orgMspId, userId, affiliation) => {
	console.log('================Register and Enroll User================')
	try {
		// Check to see if we've already enrolled the user
		const userIdentity = await wallet.get(userId);

		if (userIdentity) {
			console.log(`An identity for the user ${userId} already exists in the wallet`);
			return;
		}

		// Must use an admin to register a new user 
		const adminIdentity = await wallet.get(config.admin.userId);
		if (!adminIdentity) {
			console.log('An identity for the admin user does not exist in the wallet');
			console.log('Enroll the admin user before retrying');
			return;
		}

		// build a user object for authenticating with the CA
		const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
		const adminUser = await provider.getUserContext(adminIdentity, config.admin.userId);

		// Register the user, enroll the user, and import the new identity into the wallet.
		// if affiliation is specified by client, the affiliation value must be configured in CA
		const secret = await caClient.register({
			affiliation: affiliation,
			enrollmentID: userId,
			role: 'client'
		}, adminUser);

		const enrollment = await caClient.enroll({
			enrollmentID: userId,
			enrollmentSecret: secret
		});

		const x509Identity = {
			credentials: {
				certificate: enrollment.certificate,
				privateKey: enrollment.key.toBytes(),
			},
			mspId: orgMspId,
			type: 'X.509',
		};

		await wallet.put(userId, x509Identity);
		console.log(`Successfully registered and enrolled user ${userId} and imported it into the wallet`);
	} catch (error) { 
		console.error(`Failed to register user : ${error}`);
	}
};

exports.deregisterUser = async (ccp, wallet, userId) => {
	console.log('================Deregister User================')
	try {
		// Check to see if we've already enrolled the user
		const userIdentity = await wallet.get(userId);

		// Must use an admin to register a new user
		const adminExists = await wallet.get(config.admin.userId);
		if (!adminExists) {
			console.log('An identity for the admin user does not exist in the wallet');
			console.log('Enroll the admin user before retrying');
			return;
		}
		const gateway = new Gateway();
		await gateway.connect(ccp, { wallet, identity: config.admin.userId, discovery: config.gatewayDiscovery });

		const ca = gateway.getClient().getCertificateAuthority();
		// build a user object for authenticating with the CA
		const identityService = ca.newIdentityService();
		const adminIdentity = gateway.getCurrentIdentity();
		await ca.revoke({ enrollmentID: userName }, adminIdentity);
		identityService.delete(userName, adminIdentity, true).then(function () {
			wallet.delete(userName);
			console.log('Successfully deregistered the user ' + userName + ' and deleted it from the wallet.');
		});
		// console.log(adminUser);

		console.log(`Successfully deregistered user ${userId}`);
	} catch (error) {
		console.error(`Failed to register user : ${error}`);
	}
};