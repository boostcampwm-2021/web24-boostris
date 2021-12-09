cd /var/www/app/web24-boostris
git fetch --all
git reset --hard origin/main
cd /var/www/app/web24-boostris/front-end
npm ci
npm run build
rm -rf /var/www/html/*
cp -r /var/www/app/web24-boostris/front-end/build/* /var/www/html
cd /var/www/app/web24-boostris/back-end/api-server
pm2 reload ts-node
