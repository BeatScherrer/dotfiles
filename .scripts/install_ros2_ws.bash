#!/bin/bash

source "log.bash"

info echo "Installing the MTR ros2 workspace"

workspace_path="$HOME/src/"

cd "$workspace_path" || exit

ros2_connextdds_path="$workspace_path/ros2_connextdds/install/setup.bash"

if [[ -e $ros2_connextdds_path ]]; then
  source "$ros2_connextdds_path"

  info echo "setting RMW_IMPLEMENTATION=rmw_connextdds"
  export RMW_IMPLEMENTATION=rmw_connextdds
else
  error echo "Could not find '$ros2_connextdds_path'."
  cd - || exit
  exit 1
fi

mkdir -p "$workspace_path/ros2_ws/src" && "cd $workspace_path/ros2_ws/src"

info echo "Cloning repos"
git clone ssh://git@bitbucket.mt:7999/dv/tf2-transform-publisher.git
git clone https://github.com/ignitionrobotics/ros_ign.git
git clone ssh://git@bitbucket.mt:7999/dv/gazebo_unitr.git
git clone ssh://git@bitbucket.mt:7999/dv/ros2-unitr.git

info echo "Installing ros deps"
rosdep install --from-paths src --ignore-src -r -y

info echo "Building workspace"
colcon build --symlink-install

if $?; then
  info echo "SUCCESS"
else
  error echo "error occurred while building the ros2 workspace!"
fi

cd - || exit
