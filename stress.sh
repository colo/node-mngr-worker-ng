#!/bin/bash
for port in `seq 8082 8091`; do
	PROFILING_ENV=true NODE_ENV='production' PORT=$port npm start &
done
