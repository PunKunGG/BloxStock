import "server-only";
import { cache } from "react";

// One server timestamp per request keeps independent data reads and hydration aligned.
export const getRequestTime = cache(async () => Date.now());
