#!/usr/bin/env bash
# Builds the public site and uploads dist/ to shared hosting (cPanel / DirectAdmin).
# Copy deploy.env.example to deploy.env, fill it in, then:  ./deploy.sh
# Methods: ssh (rsync over SSH; ask the host to enable SSH if it is off) or ftps (lftp mirror).
set -euo pipefail
cd "$(dirname "$0")"
[ -f deploy.env ] || { echo "deploy.env missing; copy deploy.env.example and fill it in"; exit 1; }
# shellcheck disable=SC1091
source deploy.env
: "${DEPLOY_METHOD:?}" "${DEPLOY_HOST:?}" "${DEPLOY_USER:?}" "${DEPLOY_PATH:?}"

export PATH="${NODE_BIN:-/home/sgenc/workspace/eyeo/timing_editor/web/.toolchain/node-v20.17.0-linux-x64/bin}:$PATH"
node build.mjs
rm -f dist/CNAME   # GitHub Pages only

case "$DEPLOY_METHOD" in
  ssh)
    rsync -avz --delete --exclude '.well-known/' \
      -e "ssh -p ${DEPLOY_PORT:-22}" dist/ "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/"
    ;;
  ftps)
    if ! command -v lftp >/dev/null; then
      DEPLOY_HOST="$DEPLOY_HOST" DEPLOY_USER="$DEPLOY_USER" DEPLOY_PASS="${DEPLOY_PASS:?}" DEPLOY_PATH="$DEPLOY_PATH" \
      DEPLOY_PORT="${DEPLOY_PORT:-21}" DEPLOY_VERIFY_CERT="${DEPLOY_VERIFY_CERT:-yes}" python3 tools_deploy_ftps.py
      echo "Deployed dist/ to ${DEPLOY_HOST}:${DEPLOY_PATH}"; exit 0
    fi
    lftp -u "${DEPLOY_USER},${DEPLOY_PASS:?}" -e "
      set ftp:ssl-force true; set ftp:ssl-protect-data true; set ssl:verify-certificate ${DEPLOY_VERIFY_CERT:-yes};
      mirror -R --delete --verbose --exclude-glob .well-known/ dist/ ${DEPLOY_PATH}/;
      bye" "${DEPLOY_HOST}"
    ;;
  *) echo "DEPLOY_METHOD must be ssh or ftps"; exit 1 ;;
esac
echo "Deployed dist/ to ${DEPLOY_HOST}:${DEPLOY_PATH}"
