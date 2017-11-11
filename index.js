#!/usr/bin/env node
'use strict';

/**
 * AWS Route 53 Dynamic IP script
 */

// Declare environment variables:
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
const ZONE_ID = process.env.ZONE_ID;
const DOMAIN = process.env.DOMAIN;
const RECORD_TYPE = process.env.RECORD_TYPE;
const TTL = process.env.TTL;

// Import dependencies
const publicIp = require('public-ip');
const Route53 = require('nice-route53');
const inspect = require('util').inspect;
const inspectOpts = { colors: true, depth: Infinity };
const r53 = new Route53({
  accessKeyId     : AWS_ACCESS_KEY,
  secretAccessKey : AWS_SECRET_KEY,
});

// Pull records from hosted zone
r53.records(ZONE_ID, (err, data) => {

  if (err) return fail(err);

  // Filter out target record based on domain and record type.
  var record = data.filter(n => {
    return n.name == DOMAIN && n.type == RECORD_TYPE;
  });

  // Set target record IP address as 'currentIP'
  var currentIP = record.length > 0
    && record[0].values
    && record[0].values.length > 0
    && record[0].values[0];

  // Fetch Public IP Address as 'publicIP'
  publicIp.v4().then(publicIP => {

    //Compare values and upsert record if no match
    currentIP != publicIP ? r53.upsertRecord({
      zoneId : ZONE_ID,
      name   : DOMAIN,
      type   : RECORD_TYPE,
      ttl    : TTL,
      values : [publicIP]
    }, (err, result) => {

      if (err) return fail(result);
      process.exit(); // IP Address successfully updated

    }) : process.exit(); // IP Addresses match

  }, fail);

});

//Errors output to console log
function fail (err) {
  console.log(inspect(err, inspectOpts));
  process.exit(1);
}
