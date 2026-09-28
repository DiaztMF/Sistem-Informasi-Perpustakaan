#!/bin/sh
set -eu
cd /var/www/html

# Render inject $PORT dinamis -> sinkronkan ke nginx
: "${PORT:=8080}"
sed -i "s/listen 8080;/listen ${PORT};/" /etc/nginx/nginx.conf

# Fail fast kalau APP_KEY lupa diset
if [ -z "${APP_KEY:-}" ]; then
  echo "FATAL: APP_KEY belum diset di Environment Render." >&2
  exit 1
fi

mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

[ -e public/storage ] || php artisan storage:link || true
php artisan package:discover --ansi || true

php artisan migrate --force
php artisan db:seed --class=PerpustakaanSeeder --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
