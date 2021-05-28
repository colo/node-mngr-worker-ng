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
# source ../../../devel/etc/educativa/size.sh

#prod
source ../../../etc/educativa/size.sh

QMAIL_DIR="/var/qmail/"
#some domains SegFault (and can't capture output)
#VDOMINFO="/var/vpopmail/bin/vdominfo"
VUSERINFO="/var/vpopmail/bin/vuserinfo"

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
	ts=`date +%s%3N`
	value="emails|$HOST|$1|$ts"
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

for line in `cat ${QMAIL_DIR}/control/virtualdomains`; do
	vdom=`echo ${line} | gawk -F ':' '{print $1}'`
	#echo $vdom
	#$VDOMINFO $vdom
	dom_dir=`$VUSERINFO "postmaster@${vdom}" | grep dir | sed 's|dir:||g' | sed 's|\/postmaster||g' | xargs` #xargs trims var

	last_dir=`echo $dom_dir | gawk -F '/' '{print $NF}'`
	echo "$vdom|${dom_dir}|$last_dir"

	if [[ $vdom == $last_dir ]]; then

		if [ -n "$dom_dir" ]; then
			#echo $vdom
			#echo $dom_dir
			echo "$vdom|${dom_dir}"
			#cd $dom_dir
			if [ -f "${dom_dir}/vpasswd" ]; then
				#echo "vpasswd exists."
				while IFS= read -r vpasswd_line
				do
					#echo "$vpasswd_line"
					account=`echo ${vpasswd_line} | gawk -F ':' '{print $1}'`
					account_dir=`echo ${vpasswd_line} | gawk -F ':' '{print $6}'`

					echo "$vdom|${account}|${account_dir}"

					if [ -d "${account_dir}" ]; then
						size=`du -sk $account_dir | gawk -F '\t' '{print $1}'`
						last_auth=`$VUSERINFO "$account_dir@${vdom}" | grep 'last auth:' | sed 's|last auth:||g' | xargs` #xargs trims var
						echo "$vdom|${account}|${size}|${last_auth}" >> ${LOG_FILE}
						save "$vdom|${account}|${size}|${last_auth}"
					fi

				done < "${dom_dir}/vpasswd"
			fi


		fi

	#else
	#	echo "It's not"
	#	exit 1
	fi

done

date=$(date '+%Y-%m-%d %H:%M:%S')
echo "#End: ${date}"  >> ${LOG_FILE}


unlock
exit 0

# Remember! Lock file is removed when one of the scripts exits and it is
#           the only script holding the lock or lock is not acquired at all.
