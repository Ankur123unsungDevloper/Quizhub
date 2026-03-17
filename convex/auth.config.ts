import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: "https://clerk.quizhub.ind.in",
      applicationID: "convex",
    },
  ]
} satisfies AuthConfig;