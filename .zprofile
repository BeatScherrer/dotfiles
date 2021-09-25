# only startx if not in schroot
if [[ -f /etc/debian_chroot ]];then
  export CHROOT=$(cat /etc/debian_chroot)
fi

if [[ -z "$CHROOT" ]]; then

  if [[ $(tty) == "/dev/tty1" ]]; then
    exec startx
  else
    echo "not running grahical environment except in tty1"
  fi
  
fi
