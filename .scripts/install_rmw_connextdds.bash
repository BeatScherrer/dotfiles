source "log.bash"

MT_ROS_VERSION="galactic"

workspace="$HOME/src"

if [[ ! -d "$workspace" ]]; then
  mkdir -p "$workspace"
fi

cd "$workspace" || exit

rti_set_env_path="/opt/rti_connext_dds-6.1.0/resource/scripts/rtisetenv_x64Linux4gcc7.3.0.bash"
ros_set_env_path="/opt/ros/${MT_ROS_VERSION}/setup.bash"

if [[ -e $ros_set_env_path ]]; then
  source $ros_set_env_path
else
  error echo "could not source '${ros_set_env_path}'! make sure to install ros first"
  exit 1
fi

if [[ -e $rti_set_env_path ]]; then
  source "/opt/rti_connext_dds-6.1.0/resource/scripts/rtisetenv_x64Linux4gcc7.3.0.bash"
else
  error echo "could not source rti variables! Make sure to install the rti dds package 'rtidds610'"
  exit 1
fi

mkdir -p "ros2_connextdds/src" && cd "ros2_connextdds/src"
info echo "setting CONNEXTDDS_DIR=$NDDSHOME"
export CONNEXTDDS_DIR=${NDDSHOME}
git clone https://github.com/rticommunity/rmw_connextdds/
cd rmw_connextdds && git checkout ${MT_ROS_VERSION}
cd "$workspace/ros2_connextdds"
colcon build --symlink-install

if $?; then
  error echo "error occurred while building the workspace"
else
  info echo "SUCCESS"
fi

cd - || exit
