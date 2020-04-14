// Sample implementation of the Google/Apple Contact Tracing cryptography specification April 2020
// https://covid19-static.cdn-apple.com/applications/covid19/current/static/contact-tracing/pdf/ContactTracing-CryptographySpecification.pdf
// Copyright (c) 2020 Read Write Tools

import hkdf from 'futoin-hkdf';
import crypto from 'crypto';

export default class ContactTracing {
	
	constructor(tracingKey) {
		// The mobile device's 32 byte private key, generated exactly once when
		// the app is installed, securely stored, and never leaves the device. 
		this.tk = tracingKey;
	}
	
	dailyTracingNumber(unixTimestamp) {
		return Math.floor(unixTimestamp / (24*60*60*1000)).toString();
	}

	dailyTracingKeyInfo(Di) {
		return "CT-DTK" + Di;
	}
	
	// Use the SHA-256 one-way crytographic hashing function, over the
	// private tracing key and the daily tracing number. This results in
	// a 32 byte hash, which is truncated to a 16 byte daily tracing key.
	dailyTracingKey(dtkInfo) {
		const sha256HashLength = 32;
		const dtkiTruncateLength = 16;
		const dtki = hkdf.expand('sha256', sha256HashLength, this.tk, dtkiTruncateLength, dtkInfo);
		return dtki.toString('hex').substring(0, 16);
	}
	
	// The number of 10-minute intervals elapsed since midnight UTC
	// Result is a number from 0 to 143
	timeIntervalNumber(unixTimestamp) {
		const secondsSinceEpoch = Math.floor(unixTimestamp/1000);
		const wholeDays = Math.floor(secondsSinceEpoch / (24*60*60));
		const timeSinceMidnight = secondsSinceEpoch - wholeDays;
		return Math.floor(timeSinceMidnight / (60*10)).toString();
	}
	
	rollingProximityInfo(TINj) {
		return "CT-RPI" + TINj;
	}
	
	// Compute a rolling proximity indentifer as an HMAC of the
	// daily tracing key and the time interval number.
	// Truncate the result to 16 bytes.
	rollingProximityIdentifier(dtki, rpiInfo) {
		const obj = crypto.createHmac('sha256', dtki);
		obj.update(rpiInfo);
		const hmac = obj.digest('hex');
		return hmac.substring(0, 16);
	}
	
	// The mobile device should refresh its rolling proximity identifier every 10 minutes
	refresh(unixTimestamp) {
		const Di = this.dailyTracingNumber(unixTimestamp);
		const dtkInfo = this.dailyTracingKeyInfo(Di);
		const dtki = this.dailyTracingKey(dtkInfo);
		
		const TINj = this.timeIntervalNumber(unixTimestamp);	
		const rpiInfo = this.rollingProximityInfo(TINj);
		const RPIij = this.rollingProximityIdentifier(dtki, rpiInfo);
		
		return {
			dtki: dtki,
			RPIij: RPIij
		};
	}
}
