#!/usr/bin/env node
'use strict';

const { main } = require('../lib/create');

main(process.argv.slice(2)).then(code => {
  process.exitCode = code;
});
