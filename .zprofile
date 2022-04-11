# only startx if not in schroot
if [[ -f /etc/debian_chroot ]];then
  export CHROOT=$(cat /etc/debian_chroot)
fi

if [[ -z "$CHROOT" ]]; then

  if [[ $(tty) == "/dev/tty1" ]]; then
    exec startx
  elif [[ $(tty) == "/dev/tty2" ]]; then
    export WLR_NO_HARDWARE_CURSORS=1
    exec sway
  else
    echo "not running graphical environment. use tty1 for bspwm and tty2 for sway"
  fi
fi
