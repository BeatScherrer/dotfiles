#!/bin/sh

targetWorkspace="$1"

# i3
if pgrep i3; then
  i3-msg workspace "$targetWorkspace"
fi
