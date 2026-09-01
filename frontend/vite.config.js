import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:5000",
      "/tasks": "http://localhost:5000",
      "/todays-tasks": "http://localhost:5000",
      "/num/completed-tasks": "http://localhost:5000",
      "/upcoming-tasks": "http://localhost:5000",
      "/complete-task": "http://localhost:5000",
    },
  },
});
