#!/bin/zsh

# check if bluetooth is powered on
if [[ $(bluetoothctl show | grep "Powered: yes" ) && $(which bluetoothctl) ]]; then
  # bluetooth is powered on, check if device is connected

  # check if device is connected
  if [[ $(echo info | bluetoothctl | grep 'Device') ]]; then
    # Device is connected

    name_line=$(echo info | bluetoothctl | grep 'Name')
    parts=("${(@s|:|)name_line}")
    name=$parts[2]
    echo " $name"
  else
    # no device connected
  fi
else
  # bluetooth is not powered on
fi
