cd /root/YummyYummyAll/YummyYummyFrontendNuxt
git reset --hard HEAD
git pull origin main
npm install
npm run build
pm2 restart nuxt
chmod +x deploy_back.sh deploy_front.sh