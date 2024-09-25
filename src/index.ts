/**
 * AWS Route 53 Dynamic IP script
 */

import { Route53Client, ListResourceRecordSetsCommand, ChangeResourceRecordSetsCommand, ChangeAction } from '@aws-sdk/client-route-53';
import { config } from 'dotenv';

config();

(async () => {
  if (!process.env.ZONE_ID) {
    throw Error('Zone ID not found');
  }
  
  if (!process.env.DOMAIN_NAME) {
    throw Error('Target domain not found');
  }

  const route53 = new Route53Client({});

  const command = new ListResourceRecordSetsCommand({
    HostedZoneId: process.env.ZONE_ID,
  });

  const response = await route53.send(command);

  const [record] = response.ResourceRecordSets?.filter((set) => set.Name === `${process.env.DOMAIN_NAME}.`) || [];

  const currentIp = record.ResourceRecords![0].Value;

  const result = await fetch('https://api.ipify.org/?format=json');
  const { ip } = await result.json();

  if (currentIp !== ip) {
    if (!process.env.TTL) {
      throw Error('TTL Value not found');
    }

    const ttl = Number(process.env.TTL);
    if (Number.isNaN(ttl)) {
      throw Error('TTL Value not a number');
    }

    const command = new ChangeResourceRecordSetsCommand({
      HostedZoneId: process.env.ZONE_ID,
      ChangeBatch: {
        Changes: [{
          Action: ChangeAction.UPSERT,
          ResourceRecordSet: {
            Name: record.Name,
            ResourceRecords: [{ Value: ip }],
            Type: 'A',
            TTL: ttl
          }
        }]
      }
    });
    await route53.send(command);

    console.log(`Set ${process.env.DOMAIN_NAME} to ${ip}`);
  }
})();

