# only startx if not in schroot
if [[ -f /etc/debian_chroot ]];then
  export CHROOT=$(cat /etc/debian_chroot)
fi

if [[ ! $CHROOT ]]; then
  exec startx
fi
