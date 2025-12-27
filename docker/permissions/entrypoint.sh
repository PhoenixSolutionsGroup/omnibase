#!/bin/sh
set -e

# Download custom namespaces from R2/S3 if configured
if [ -n "$NAMESPACE_BUCKET" ]; then
  echo "📥 Downloading custom namespaces"

  # Configure AWS CLI for R2
  export AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY"
  export AWS_SECRET_ACCESS_KEY="$R2_SECRET_KEY"

  # Download and extract
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


# Execute the command (either migrate or serve)
exec keto "$@"