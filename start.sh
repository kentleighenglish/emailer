#!/usr/bin/env bash

if [ "$1" = "--production" ]; then
	npm run build

	export NODE_ENV=production
	node index.js
else
	source '.env';
	nodemon index.js
fi
