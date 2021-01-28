# Gravel Pit Color Theme

![gravel-pit example](https://raw.githubusercontent.com/BeatScherrer/gravel-pit/master/gravel_pit_example.png)

Welcome to my color theme. Since I was unhappy with many color themes for C++ I decided to create my own and publish it.
The theme is oriented on earthy colors which are light to the eye for the basic entities. highly interesting entities such as objects, variables, methods and function are given a brighter color to immediately differentiate them.
The colors range from anything that can be found in a pit from dirt to water and even gemstones, and thus the name.

_The theme is still under development and thus will change often._

## C++
The main items which I want to differentiate for C++ explicitly from the rest are the following:
* **Functions** and **methods**:
It should be clear on first sight what is a function, a method and visually separate them from the rest.


## Reference for tokens:
https://www.sublimetext.com/docs/3/scope_naming.html

A very useful extension for better C++ Syntax highlighting is provided by the following extension:
[Better C++ Syntax](https://marketplace.visualstudio.com/items?itemName=jeff-hykin.better-cpp-syntax)

# Contribution
Contribution for other languages are very welcome to create a consistent and complete theme across various languages.

## Jsonnet
The theme is developed with [jsonnet](https://jsonnet.org/learning/tutorial.html) which allows to define variables and generate a `.json` file. This makes changes to colors a lot easier since they dont have to be hardcoded.

### Installation
(recommended) for building with bazel install bazel:
```
yay bazel
```

with arch based distros simply install jsonnet with the AUR helper:
```
yay jsonnet
```

### Build
To build the themes from the `.jsonnet` files run the following command in the `vscode_theme` directory as the working directory.
```
bazel build //gravel-pit:all
```

## Developing
Developing the color themes is easy. Simply open the repo and run the debugger with `f5`. A new windows should open where the local themes in the `themes` folder can be selected.

When making updates to the `.jsonnet` file to see the changes the build task must be executed which also copies the generated `.json` files to the `themes` directory. Run the build task with `Ctrl + b` and select 'build theme'.


# TODO
 - Terminal colors (especially color links)
 - improve C++ color scheme
