#!/bin/bash

# only startx if not in schroot
export CHROOT="$SCHROOT_CHROOT_NAME"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

# for java top task
export _JAVA_AWT_WM_NONREPARENTING=1
. "$HOME/.cargo/env"

export QT_AUTO_SCREEN_SCALE_FACTOR=1

# Start Desktop environments

# BSPWM
if [[ -z "$CHROOT" && $(tty) == "/dev/tty1" ]]; then
	exec startx
fi

# SWAY
if [[ -z "$CHROOT" && $(tty) == "/dev/tty2" ]]; then
	echo "running sway"
	export __GL_GSYNC_ALLOWED=0
	export __GL_VRR_ALLOWED=0
	export __GLX_VENDOR_LIBRARY_NAME=nvidia
	export WLR_DRM_NO_ATOMIC=1
	export QT_QPA_PLATFORM=wayland
	export QT_WAYLAND_DISABLE_WINDOWDECORATION=1
	export GDK_BACKEND=wayland
	export XDG_CURRENT_DESKTOP=sway
	export GBM_BACKEND=nvidia-drm
	export MOZ_ENABLE_WAYLAND=1
	export WLR_NO_HARDWARE_CURSORS=1
	sway --unsupported-gpu
fi
