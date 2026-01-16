#!/bin/bash
export PATH=$PATH:/opt/homebrew/bin
cd /Users/manikantaamara/Desktop/Antigravity/Novels_dashboard
echo "Starting Novels Dashboard Server..."
(sleep 3 && open http://localhost:3001) &
npm start
