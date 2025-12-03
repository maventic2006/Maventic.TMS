module.exports = {
  apps: [
    {
      name: "frontend-server",
      cwd: "/home/tms/actions-runner/_work/Maventic.TMS/Maventic.TMS/frontend",
      script: "npx",
      args: "serve -s dist -l 5174",
      env_file: "/home/tms/actions-runner/_work/Maventic.TMS/Maventic.TMS/frontend/.env",
      env: {
        NODE_ENV: "development",
        PORT: 5174
      }
    },
    {
      name: "tms-backend-server",
      cwd: "/home/tms/actions-runner/_work/Maventic.TMS/Maventic.TMS/tms-backend",
      script: "npm",
      args: "start",
      env_file: "/home/tms/actions-runner/_work/Maventic.TMS/Maventic.TMS/tms-backend/.env",
      env: {
        NODE_ENV: "development",
        PORT: 5001
      }
    }
  ]
}
