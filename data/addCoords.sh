#!/bin/bash

# lonLat2Locator <lon> <lat>
function lonLat2Locator {
	if [[ "$1" == "" ]]; then
		echo "-"
	elif [[ "$2" == "" ]]; then
		echo "-"
	fi
	lon="$( bc <<<" $1 + 180" )"
	lat="$( bc <<<" $2 + 90" )"
	fieldIndexLon="$( bc <<<"$lon / 20 + 65" )"
	fieldIndexLat="$( bc <<<"$lat / 10 + 65" )"
	lon="$( bc <<<"$lon % 20" )"
	lat="$( bc <<<"$lat % 10" )"
	squareIndexLon="$( bc <<<"$lon / 2" )"
	squareIndexLat="$( bc <<<"$lat / 1" )"
	subSquareIndexLon="$( bc <<<"$lon % 2 / 0.083333 + 65" )"
	subSquareIndexLat="$( bc <<<"$lat % 1 / 0.0416665 + 65" )"
	printf "\x$(printf %x $fieldIndexLon)"
	printf "\x$(printf %x $fieldIndexLat)"
	echo -n $squareIndexLon$squareIndexLat
	printf "\x$(printf %x $subSquareIndexLon)"
	printf "\x$(printf %x $subSquareIndexLat)"
}
#lonLat2Locator "-9.3839104" "39.3677239"
#exit

# getMatchingResult <nominatimResults> <locator>
function getMatchingResult {
	if [[ "$1" == "" ]]; then
		return
	fi
	echo "$1" | while read -r resp; do
		lon="$(echo "$resp" | jq -r '.lon')"
		lat="$(echo "$resp" | jq -r '.lat')"
		calcLocator="$(lonLat2Locator "$lon" "$lat")"
		if [[ "$2" == "$calcLocator" ]]; then
			echo "$resp"
			return
		fi
	done
}

first=true
while read line; do
	if [[ $first == true ]]; then
		first=false
		echo "$line,lat,lon"
		continue
	fi
	QTH="$(echo "$line" | cut -d',' -f4)"
	locator="$(echo "$line" | cut -d',' -f5)"
	resps="$(curl -s "https://nominatim.openstreetmap.org/search?format=json&q=$QTH" | jq -c '.[]')"
	relais="$(getMatchingResult "$resps" "$locator")"
	if [[ "$relais" == "" ]]; then
		echo "$line,NULL,NULL"
		continue
	fi
	lat="$(echo "$relais" | jq '.lat')"
	lon="$(echo "$relais" | jq '.lon')"
	echo "$line,$lat,$lon"
	#break
done <"$1"

