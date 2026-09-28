# syntax=docker/dockerfile:1
FROM php:8.3-fpm-alpine
WORKDIR /var/www/html

# System deps + PHP extensions Laravel (pdo_pgsql, gd, opcache, dkk)
RUN apk add --no-cache \
      nginx supervisor curl \
      libpq libzip libpng libjpeg-turbo freetype icu-libs \
    && apk add --no-cache --virtual .build-deps \
      $PHPIZE_DEPS postgresql-dev libzip-dev libpng-dev \
      libjpeg-turbo-dev freetype-dev icu-dev oniguruma-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
      pdo_pgsql pgsql bcmath gd zip opcache intl exif pcntl \
    && apk del .build-deps \
    && rm -rf /tmp/* /var/cache/apk/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1

# Layer cache: install PHP dependencies dulu
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction --prefer-dist

# Copy seluruh source code (termasuk public/build hasil npm run build lokal)
COPY . .

# Generate optimized autoloader
RUN composer dump-autoload --optimize --no-dev --no-interaction

# Permission Laravel
RUN mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache /run \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chmod +x 00-laravel-deploy.sh

# PHP production tuning
RUN { \
      echo 'opcache.enable=1'; \
      echo 'opcache.memory_consumption=256'; \
      echo 'opcache.interned_strings_buffer=16'; \
      echo 'opcache.max_accelerated_files=20000'; \
      echo 'opcache.validate_timestamps=0'; \
      echo 'opcache.save_comments=1'; \
      echo 'expose_php=0'; \
      echo 'memory_limit=256M'; \
      echo 'upload_max_filesize=20M'; \
      echo 'post_max_size=20M'; \
    } > /usr/local/etc/php/conf.d/production.ini

COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT:-8080}/up || exit 1

CMD ["/var/www/html/00-laravel-deploy.sh"]
