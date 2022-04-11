#!/bin/sh

STATUS="$(nordvpn status 2>/dev/null | grep Status | tr -d ' ' | cut -d ':' -f2)"

if [[ "$STATUS" == "Connected" ]]; then
  # get the country we are connected to
  country=$(nordvpn status | grep Country | tr -s ' ' | cut -d ' ' -f2)

  echo " $country"
else
  echo ""
fi
