// Contact Tracing with Android/iPhone
// How the new Google/Apple partnership may help us get back to our normal routine
// https://medium.com/@joehonton/2020-014-contact-tracing-with-android-iphone-42e20c8f0cb2

import ContactTracing from './contact-tracing.class.js';

// Instantiate with the mobile device's 32-byte private key
const ct = new ContactTracing('a1b2c3d411jj99kk55gg66hhz0y9x8w7');

// Test data for Medium article "Contact Tracing with Android/iPhone"
const encounters = [
	{person: 'Uber driver',    ts: 'May 15, 2020 16:21:00'},
	{person: 'Nearby shopper', ts: 'May 15, 2020 16:51:00'},
	{person: 'Stranger',       ts: 'May 16, 2020 17:06:00'},
	{person: 'Store clerk',    ts: 'May 16, 2020 17:11:00'},
];

process.stdout.write(`     dtki              RPIij             person     \n`);
process.stdout.write(`----------------  ----------------  ----------------\n`);

for (let encounter of encounters) {
	const unixTimestamp = Date.parse(encounter.ts);
	const data = ct.refresh(unixTimestamp);
	process.stdout.write(`${data.dtki} ${data.RPIij} ${encounter.person} \n`);
}

