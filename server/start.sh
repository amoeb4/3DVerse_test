#!/bin/bash

node server.js &
SERVER_PID=$!

gnome-terminal -- bash -c "node client.js; exec bash" &
CLIENT_TERM_PID=$!
sleep 1
cleanup() {
  echo -e "\nserver stop"
  if kill -0 $SERVER_PID 2>/dev/null; then
    kill $SERVER_PID
  fi
  if kill -0 $CLIENT_TERM_PID 2>/dev/null; then
    kill $CLIENT_TERM_PID
  fi
  exit
}
trap cleanup SIGINT
wait $SERVER_PID
