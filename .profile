# ~/.profile: executed by the command interpreter for login shells.
# This file is not read by bash(1), if ~/.bash_profile or ~/.bash_login
# exists.
# see /usr/share/doc/bash/examples/startup-files for examples.
# the files are located in the bash-doc package.

# the default umask is set in /etc/profile; for setting the umask
# for ssh logins, install and configure the libpam-umask package.
#umask 022

# if running bash
if [ -n "$BASH_VERSION" ]; then
    # include .bashrc if it exists
    if [ -f "$HOME/.bashrc" ]; then
	. "$HOME/.bashrc"
    fi
fi

# set PATH so it includes user's private bin if it exists
if [ -d "$HOME/bin" ] ; then
    PATH="$HOME/bin:$PATH"
fi

# set PATH so it includes user's private bin if it exists
if [ -d "$HOME/.local/bin" ] ; then
    PATH="$HOME/.local/bin:$PATH"
fi
export PATH=/opt/gcc-arm-none-eabi-6-2017-q2-update/bin:$PATH
export PATH=/home/beat/git/ardupilot/Tools/autotest:$PATH

export XDG_CONFIG_HOME="$HOME/.config"

# use ccache if it is installed
if type ccache &> /dev/null; then
  export PATH=/usr/lib/ccache/bin/:$PATH
fi

# source ros if present
if [ -f "/opt/ros/melodic/setup.sh" ]; then
	echo "sourcing ROS /opt/ros/melodic/setup.sh"
	source "/opt/ros/melodic/setup.sh"
  # gazebo
  export IGN_IP=127.0.0.1
fi

