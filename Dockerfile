# syntax=docker/dockerfile:1
FROM php:8.4-fpm-alpine
WORKDIR /var/www/html

# System tools minimal + ekstensi database postgres & opcache
RUN apk add --no-cache nginx supervisor curl git unzip postgresql-dev \
    && docker-php-ext-install -j$(nproc) pdo_pgsql opcache

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1
ENV COMPOSER_MEMORY_LIMIT=-1

# Copy source code (termasuk pre-built frontend di public/build)
COPY . .

# Install PHP dependencies tanpa bloat & abaikan platform check yang bikin exit code 2
RUN composer install --no-dev --no-scripts --optimize-autoloader --no-interaction --prefer-dist --ignore-platform-reqs

# Permission Laravel
RUN mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache /run \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chmod +x 00-laravel-deploy.sh

COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 8080

CMD ["/var/www/html/00-laravel-deploy.sh"]
