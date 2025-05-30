FROM nginx:alpine

# Create HTML with login button
RUN mkdir -p /usr/share/nginx/html && \
echo '<!DOCTYPE html>\
<html>\
<head>\
    <title>World Builder</title>\
    <style>\
        body {\
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\
            background: #1a1a1a;\
            color: white;\
            margin: 0;\
            padding: 50px;\
            text-align: center;\
        }\
        .container {\
            max-width: 800px;\
            margin: 0 auto;\
        }\
        h1 {\
            font-size: 3rem;\
            color: #4CAF50;\
            margin-bottom: 1rem;\
        }\
        .status {\
            background: #333;\
            padding: 20px;\
            border-radius: 10px;\
            margin: 20px 0;\
        }\
        .button {\
            display: inline-block;\
            background: #5865F2;\
            color: white;\
            padding: 12px 24px;\
            border-radius: 5px;\
            margin: 10px;\
            text-decoration: none;\
            font-weight: bold;\
        }\
        .button:hover {\
            background: #4752C4;\
        }\
        .button.secondary {\
            background: #4CAF50;\
        }\
        .button.secondary:hover {\
            background: #45a049;\
        }\
    </style>\
</head>\
<body>\
    <div class="container">\
        <h1>World Builder</h1>\
        <p>AI-Powered D&D Session Management</p>\
        \
        <div class="status">\
            <h2>API Status</h2>\
            <p id="api-status">Checking...</p>\
        </div>\
        \
        <div>\
            <a href="https://api.worldbuilder.app/api/auth/discord" class="button">\
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle; margin-right: 8px;">\
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>\
                </svg>\
                Login with Discord\
            </a>\
            <a href="https://api.worldbuilder.app/health" class="button secondary">API Health</a>\
        </div>\
    </div>\
    \
    <script>\
        // Check if we just logged in\
        const urlParams = new URLSearchParams(window.location.search);\
        if (urlParams.get("login") === "success") {\
            const username = urlParams.get("user");\
            alert(`Welcome, ${username}!`);\
            window.history.replaceState({}, document.title, "/");\
        }\
        \
        // Check API status\
        fetch("https://api.worldbuilder.app/health")\
            .then(r => r.json())\
            .then(data => {\
                document.getElementById("api-status").innerHTML = \
                    `<span style="color: #4CAF50;">✓ API is ${data.status}</span>`;\
            })\
            .catch(err => {\
                document.getElementById("api-status").innerHTML = \
                    `<span style="color: #f44336;">✗ API is offline</span>`;\
            });\
    </script>\
</body>\
</html>' > /usr/share/nginx/html/index.html

# Configure nginx
RUN echo 'server {\
    listen 3000;\
    server_name localhost;\
    root /usr/share/nginx/html;\
    index index.html;\
    location / {\
        try_files $uri $uri/ /index.html;\
    }\
}' > /etc/nginx/conf.d/default.conf

EXPOSE 3000
