#!/bin/bash

ros2_connextdds_path="$HOME/src/ros2_connextdds/install/setup.bash"
workspace_path="$HOME/src/ros2_ws"

source "log.bash"

info echo "Installing the MTR ros2 workspace"

if [[ ! -d "workspace_path" ]]; then
  mkdir -p $workspace_path
fi

cd "$workspace_path" || exit

if [[ -e $ros2_connextdds_path ]]; then
  source "$ros2_connextdds_path"

  info echo "setting RMW_IMPLEMENTATION=rmw_connextdds"
  export RMW_IMPLEMENTATION=rmw_connextdds
else
  error echo "Could not find '$ros2_connextdds_path'."
  cd - || exit
  exit 1
fi

if [[ -e "/opt/ros/galactic/setup.bash" ]]; then
  source "/opt/ros/galactic/setup.bash"
else
  error echo "could not source ros, make sure to install ros first"
  exit 1
fi

mkdir src && cd src

info echo "Cloning repos"
git clone ssh://git@bitbucket.mt:7999/dv/tf2-transform-publisher.git
git clone https://github.com/ignitionrobotics/ros_ign.git --branch galactic
git clone ssh://git@bitbucket.mt:7999/dv/gazebo_unitr.git
git clone ssh://git@bitbucket.mt:7999/dv/ros2-unitr.git

info echo "Installing ros deps"

# this is where dependencies are not getting installed?????????
rosdep install --from-paths src/* --ignore-src -r -y

cd ..

info echo "Building workspace"
colcon build --symlink-install

if [[ "$?" == 0 ]]; then
  info echo "SUCCESS"
else
  error echo "error occurred while building the ros2 workspace!"
fi

cd - || exit
