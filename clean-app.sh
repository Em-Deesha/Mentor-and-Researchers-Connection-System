#!/bin/sh
if [ -f src/App.jsx ]; then
  sed -i 's/demo@academic-match\.com/DEMO_EMAIL_REMOVED/g' src/App.jsx
  sed -i 's/demo123/DEMO_PASSWORD_REMOVED/g' src/App.jsx
  sed -i 's/firebase-user@academic-matchmaker\.com/DEMO_EMAIL_REMOVED/g' src/App.jsx
  sed -i 's/firebase-auth-bridge/DEMO_PASSWORD_REMOVED/g' src/App.jsx
fi

