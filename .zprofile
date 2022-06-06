#!/usr/bin/zsh

# set XDG directories
export XDG_CONFIG_HOME="${HOME}/.config"
export XDG_CACHE_HOME="${HOME}/.cache"
export XDG_DATA_HOME="${HOME}/.local/share"
export XDG_STATE_HOME="${HOME}/.local/state"

# only startx if not in schroot
if [[ -z "$SCHROOT_CHROOT_NAME" ]]; then

  if [[ $(tty) == "/dev/tty1" ]]; then
    echo "running bspwm"
    exec startx
  elif [[ $(tty) == "/dev/tty2" ]]; then
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
    export MOZ_ENABLE_WAYLAND=1
	  exec sway --unsupported-gpu
  else
    echo "not running graphical environment. use tty1 for bspwm and tty2 for sway"
  fi
fi
