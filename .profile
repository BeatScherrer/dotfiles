#!/bin/bash

export EDITOR=vim

if [[ -z "$SCHROOT_CHROOT_NAME" ]]; then

  if [[ $(tty) == "/dev/tty2" ]]; then
    exec startx
  elif [[ $(tty) == "/dev/tty3" ]]; then
    echo "running sway"
    export __GL_GSYNC_ALLOWED=0
    export __GL_VRR_ALLOWED=0
    export WLR_DRM_NO_ATOMIC=1
    export QT_AUTO_SCREEN_SCALE_FACTOR=1
    export QT_QPA_PLATFORM=wayland
    export QT_WAYLAND_DISABLE_WINDOWDECORATION=1
    export GDK_BACKEND=wayland
    export XDG_CURRENT_DESKTOP=sway
    export GBM_BACKEND=nvidia-drm
    export __GLX_VENDOR_LIBRARY_NAME=nvidia
    export MOZ_ENABLE_WAYLAND=1
    export WLR_NO_HARDWARE_CURSORS=1
    sway --unsupported-gpu
  fi
fi

if [[ -d "/opt/homebrew" ]]; then
  echo "directory homebrew exists"
  eval "$(/opt/homebrew/bin/brew shellenv)"
fi

source ~/.bashrc
