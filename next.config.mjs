/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/v0/b/diet-exercise-tracker.appspot.com/o/**",
      },
    ],
  },
};

export default nextConfig;
