# Mediq Appointment Booking System

## Instructions

1. Install dependencies:
```bash
bun install
```

2. Start the development server:
```bash
bun run dev
```

3. Build the project:
```bash
bun run build
```

# NGINX Configuration

Provided example NGINX configuration for serving two react applications on different ports.

```nginx
map $server_port $site_root {
    9191 html/mediq;
    9595 html/mycamp;
}

server {
    listen      9595;
    listen      9191;
    server_name localhost;

    root $site_root;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        rewrite ^/api/(.*)$ /$1 break;
        proxy_pass http://localhost:7070/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```



# After fork 

