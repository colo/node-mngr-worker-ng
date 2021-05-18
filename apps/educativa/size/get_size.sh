#!/bin/bash
# SPDX-License-Identifier: MIT

## Copyright (C) 2009 Przemyslaw Pawelczyk <przemoc@gmail.com>
##
## This script is licensed under the terms of the MIT license.
## https://opensource.org/licenses/MIT
#
# Lockable script boilerplate

### HEADER ###

#devel
#source ../../../devel/etc/educativa/size.sh

#prod
source ../../../etc/educativa/size.sh

DIRVISH_DIR="${PREFIX}var/backups/dirvish/"
LOCK_DIR="${PREFIX}var/lock/"
LOG_DIR="${PREFIX}var/log/"

LOG_FILE="${LOG_DIR}`basename $0`.log"
LOCKFILE="${LOCK_DIR}`basename $0`"
LOCKFD=99

# PRIVATE
_lock()             { flock -$1 $LOCKFD; }
_no_more_locking()  { _lock u; _lock xn && rm -f $LOCKFILE; }
_prepare_locking()  { eval "exec $LOCKFD>\"$LOCKFILE\""; trap _no_more_locking EXIT; }

# ON START
_prepare_locking

# PUBLIC
exlock_now()        { _lock xn; }  # obtain an exclusive lock immediately or fail
exlock()            { _lock x; }   # obtain an exclusive lock
shlock()            { _lock s; }   # obtain a shared lock
unlock()            { _lock u; }   # drop a lock

### BEGIN OF SCRIPT ###

# Simplest example is avoiding running multiple instances of script.
exlock_now || exit 1

date=$(date '+%Y-%m-%d %H:%M:%S')
echo "#Start: ${date}"  > ${LOG_FILE}

save () {
	ts=`date +%s`
	value="$1|$ts"
	resp=$(curl -s -u ${CREDENTIALS} --header "Content-Type: application/json" --request POST --data "{\"value\": \"$value\"}" ${API_SERVER})
	status="$?"
	#echo "response: ${response}"
	echo "status: ${status}"
	if (( ${status} > 0 )); then
		echo "sleeping to retry..."
		echo "Status: ${status}, sleeping to retry..." >> ${LOG_FILE}
		sleep 2
		save $1
	else
		echo "- saved" >> ${LOG_FILE}
	fi
}

cd $DIRVISH_DIR
for dir in `ls -d */`; do
	dir=`echo ${dir} | sed 's|\/||g'`
	cd ${dir}/${dir}-vhosts/lastest/

	for user_dir in `ls -d */`; do
		user_dir=`echo ${user_dir} | sed 's|\/||g'`
		#size=`du $subdir | gawk -F '\t' '{print $1}'`
		#echo $dir:$subdir:$size
		cd ${user_dir}

		for subdir in `ls -d */`; do
			subdir=`echo ${subdir} | sed 's|\/||g'`
			size=`du -k $subdir | gawk -F '\t' '{print $1}'`
			echo "$dir|$user_dir|$subdir|$size" >> ${LOG_FILE}
			save "$dir|$user_dir|$subdir|$size"
		done

		cd ..
	done

	cd ../../../
done

date=$(date '+%Y-%m-%d %H:%M:%S')
echo "#End: ${date}"  >> ${LOG_FILE}


unlock
exit 0

# Remember! Lock file is removed when one of the scripts exits and it is
#           the only script holding the lock or lock is not acquired at all.
