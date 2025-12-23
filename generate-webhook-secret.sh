#!/bin/bash
set -e

SECRET_NAME="GITHUB_WEBHOOK_SECRET"
SECRET_VALUE=$(openssl rand -hex 32)

echo "Generated webhook secret:"
echo
echo "$SECRET_VALUE"
echo
echo "Add this to your environment as:"
echo "$SECRET_NAME=$SECRET_VALUE"