#!/bin/sh

wid=$1
class=$2
instance=$3
consequences=$4


# make android emulator floating since no WM_CLASS attribute is present
case $class in
  # no class name
  '')
     pid=$(xprop -id $wid _NET_WM_PID | awk '{print $NF}')
     [ -n "$pid" ] && cmd="$(ps -q "$pid" -o comm= 2>/dev/null)"
     [ "$cmd" = qemu-system-x86 ] && echo "state=floating desktop=^6"
     [ "$cmd" = qemu-system-i386 ] && echo "state=floating desktop=^6"
     [ "$cmd" = spotify ] && echo "desktop=^5"
     ;;
esac
