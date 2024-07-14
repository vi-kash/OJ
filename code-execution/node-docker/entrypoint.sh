#!/bin/bash

if [ -f "/code/input.txt" ]; then
  node code.js < /code/input.txt
else
  echo "Input file not found!"
fi
