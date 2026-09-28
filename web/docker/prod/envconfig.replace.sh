#!/bin/sh

set -e

envsubst < "/var/www/config/envconfig.template.html" > "/var/www/config/envconfig.html"
