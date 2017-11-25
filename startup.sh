#!/bin/sh

dnsmasq -k &
node /app/node_modules/babel-cli/bin/babel-node /app/server.js
