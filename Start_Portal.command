#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
"$DIR/start_background.sh"
open "http://localhost:3000"
