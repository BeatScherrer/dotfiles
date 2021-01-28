#include <iostream>

class Student {

public:
Student() {}

std::string getName() {return this->name_;}

private:
std::string name_;

};

int main(int argc, char** argv) {
  Student fabio;
  fabio.getName();
}