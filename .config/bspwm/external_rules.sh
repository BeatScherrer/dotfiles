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
     [ "$cmd" = spotify ] && echo "desktop=^5"
     [ "$cmd" = steam ] && echo "desktop=^3"
     [ "$cmd" = "mt-gnuplot-visualizer" ] && echo "state=floating"
     ;;
esac
