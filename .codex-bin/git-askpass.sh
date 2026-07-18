#!/bin/sh

case "$1" in
  *Username*) printf '%s\n' 'x-access-token' ;;
  *Password*) tr -d '\r\n' < "$DUKE_PAT_FILE" ;;
esac
