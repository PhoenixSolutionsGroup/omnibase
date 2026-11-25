#!/bin/sh
set -e

if [ -n "$API_INTERNAL_URL" ] && [ -n "$API_SERVICE_KEY" ]; then
  echo "📥 Fetching storage credentials from the API"

  attempt=1
  creds=""
  while [ "$attempt" -le 10 ]; do
    if creds=$(curl -fsS --connect-timeout 2 --max-time 5 \
      -H "X-Service-Key: $API_SERVICE_KEY" \
      "$API_INTERNAL_URL/api/v1/storage/credentials" 2>/dev/null); then
      break
    fi
    attempt=$((attempt + 1))
    sleep 2
  done

  if [ -n "$creds" ]; then
    export AWS_ACCESS_KEY_ID="$(printf '%s' "$creds" | jq -r '.access_key // empty')"
    export AWS_SECRET_ACCESS_KEY="$(printf '%s' "$creds" | jq -r '.secret_key // empty')"
    export AWS_SESSION_TOKEN="$(printf '%s' "$creds" | jq -r '.session_token // empty')"

    api_bucket="$(printf '%s' "$creds" | jq -r '.bucket_name // empty')"
    api_endpoint="$(printf '%s' "$creds" | jq -r '.endpoint // empty')"
    api_region="$(printf '%s' "$creds" | jq -r '.region // empty')"
    if [ -n "$api_bucket" ]; then NAMESPACE_BUCKET="$api_bucket"; fi
    if [ -n "$api_endpoint" ]; then R2_ENDPOINT="$api_endpoint"; fi
    if [ -n "$api_region" ]; then AWS_DEFAULT_REGION="$api_region"; fi
  else
    echo "⚠️  Could not fetch storage credentials, using defaults"
  fi
fi

if [ -n "$NAMESPACE_BUCKET" ]; then
  echo "📥 Downloading custom namespaces"

  export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-$R2_ACCESS_KEY}"
  export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-$R2_SECRET_KEY}"
  export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-auto}"
  if [ -z "$AWS_SESSION_TOKEN" ]; then
    unset AWS_SESSION_TOKEN
  fi

  aws s3 cp \
    --endpoint-url "$R2_ENDPOINT" \
    "s3://$NAMESPACE_BUCKET/internal/permissions.zip" \
    /tmp/namespaces.zip || echo "⚠️  No custom namespaces found, using defaults"

  if [ -f /tmp/namespaces.zip ]; then
    rm -rf /etc/config/permissions/namespaces/*

    unzip -o /tmp/namespaces.zip '*.ts' -d /etc/config/permissions/namespaces/

    echo "✅ Custom namespaces loaded"
  fi
fi

rm -f /etc/config/permissions/namespaces/types.ts

# Execute the command (either migrate or serve)
exec keto "$@"
