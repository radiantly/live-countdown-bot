module.exports = {
  apps: [
    {
      name: "bot",
      script: "./cluster.js",
      env_production: {
        NODE_ENV: "production",
      },
    },
    {
      name: "parsedateserver",
      script: "gunicorn --workers 4 parsedates:app --bind unix:///tmp/parsedateserver.sock",
    },
  ],
};
