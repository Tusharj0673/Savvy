// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   // reactCompiler: true,
//   images:{
//     remotePatterns: [{

    
//       protocol:"https",
//       hostname: "randomuser.me",
//     },
//   ],
//   },
// };

// export default nextConfig;
import type { NextConfig } from "next";
// import type { NextConfig } from "next/dist/server/config";


const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
  experimental:{
  serverActions:{
    bodySizeLimit: "5mb",
  },
},
};

export default nextConfig;


// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "randomuser.me",
//       },
//     ],
//   },
// };

// export default nextConfig;

