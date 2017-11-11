## Node.js Dynamic IP Address script for AWS Route 53 Hosted Zones

Setup dependencies using `yarn install`

### Sample script to set variables:

```
#!/bin/bash
export AWS_ACCESS_KEY="XXXXXXXXXXXXXXXXXXXX"
export AWS_SECRET_KEY="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
export ZONE_ID="XXXXXXXXXXXXXX"
export DOMAIN="example.com"
export TTL=300
npm start
```
