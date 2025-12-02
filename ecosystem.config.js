module.exports = {
    apps: [
      {
        name: "frontend-server",
        cwd: "/home/tms/actions-runner/Maventic.TMS/Maventic.TMS/frontend",
        script: "npx",
        args: "serve -s dist -l 5174",
        env: {
          NODE_ENV: "production"
        }
      },
      {
        name: "tms-backend-server",
         cwd: "/home/tms/actions-runner/Maventic.TMS/Maventic.TMS/tms-backend",
        script: "npm",
        args: "start",
        env: {
          NODE_ENV: "production",
          PORT: 5001
        }
      }
    ]
  }
  