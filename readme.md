# Простейший пример чата с собственным веб-сокет сервером

## Сервер

Дабы не открывать в мир лишние порты воспользуемся умением nginx проксировать ws  
Для этого в раздел `server` конфига добавим

```nginx
location /ws {
    proxy_pass http://127.0.0.1:27800; # здесь порт на котором будет запущен ws-сервер
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

Также необходимо увеличить таймауты в разделе `http`

```nginx
keepalive_timeout             86400s;
proxy_connect_timeout     86400s;
proxy_read_timeout        86400s;
proxy_send_timeout        86400s;
```

Папка `server`  
Запустить `composer install`  
Запустить сервер: `php ./chatWorker.php start`  

## Веб-клиент

Папка `web`  
В 9 строке `app.js` укажите адрес вашего nginx  
Запускаем `index.html`  

## React Native клиент

Создаем новое `npx react-native init AwesomeProject`  
Или берем имеющееся приложение  
Подключаем компонент `Chat` из папки `react native`  
На 19 строке меняем адрес на адрес вашего nginx  
Деплоим на девайс или эмулятор  
