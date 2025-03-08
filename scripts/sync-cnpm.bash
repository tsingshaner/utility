#!/bin/bash

PUBLISHED_PACKAGES=$1

echo "$PUBLISHED_PACKAGES" | jq -c '.[]' | while read package; do
  NPM_PACKAGE_NAME=$(echo $package | jq -r '.name')
  echo "Syncing CNPM $NPM_PACKAGE_NAME"
  LOG_ID=$(curl -X PUT "https://registry.npmmirror.com/${NPM_PACKAGE_NAME}/sync?publish=true&nodeps=false" | jq -r '.logId')
  echo "Log URL: https://registry.npmmirror.com/-/package/${NPM_PACKAGE_NAME}/syncs/${LOG_ID}/log"
done
