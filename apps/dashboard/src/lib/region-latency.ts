import * as React from "react";

// Vultr ping endpoints (using their official looking glass servers)
export const VULTR_PING_ENDPOINTS: Record<string, string> = {
  ewr: "https://nj-us-ping.vultr.com/vultr.com.100KB.bin",
  ord: "https://il-us-ping.vultr.com/vultr.com.100KB.bin",
  dfw: "https://tx-us-ping.vultr.com/vultr.com.100KB.bin",
  sea: "https://wa-us-ping.vultr.com/vultr.com.100KB.bin",
  lax: "https://lax-ca-us-ping.vultr.com/vultr.com.100KB.bin",
  atl: "https://ga-us-ping.vultr.com/vultr.com.100KB.bin",
  ams: "https://ams-nl-ping.vultr.com/vultr.com.100KB.bin",
  lhr: "https://lon-gb-ping.vultr.com/vultr.com.100KB.bin",
  fra: "https://fra-de-ping.vultr.com/vultr.com.100KB.bin",
  par: "https://par-fr-ping.vultr.com/vultr.com.100KB.bin",
  waw: "https://waw-pl-ping.vultr.com/vultr.com.100KB.bin",
  mad: "https://mad-es-ping.vultr.com/vultr.com.100KB.bin",
  sto: "https://sto-se-ping.vultr.com/vultr.com.100KB.bin",
  nrt: "https://hnd-jp-ping.vultr.com/vultr.com.100KB.bin",
  itm: "https://osk-jp-ping.vultr.com/vultr.com.100KB.bin",
  sgp: "https://sgp-ping.vultr.com/vultr.com.100KB.bin",
  icn: "https://sel-kor-ping.vultr.com/vultr.com.100KB.bin",
  bom: "https://bom-in-ping.vultr.com/vultr.com.100KB.bin",
  del: "https://del-in-ping.vultr.com/vultr.com.100KB.bin",
  blr: "https://blr-in-ping.vultr.com/vultr.com.100KB.bin",
  mel: "https://mel-au-ping.vultr.com/vultr.com.100KB.bin",
  syd: "https://syd-au-ping.vultr.com/vultr.com.100KB.bin",
  jnb: "https://jnb-za-ping.vultr.com/vultr.com.100KB.bin",
  sao: "https://sao-br-ping.vultr.com/vultr.com.100KB.bin",
  mia: "https://fl-us-ping.vultr.com/vultr.com.100KB.bin",
  mex: "https://mex-mx-ping.vultr.com/vultr.com.100KB.bin",
  scl: "https://scl-cl-ping.vultr.com/vultr.com.100KB.bin",
  hnl: "https://hon-hi-us-ping.vultr.com/vultr.com.100KB.bin",
  yto: "https://tor-ca-ping.vultr.com/vultr.com.100KB.bin",
  tlv: "https://tlv-il-ping.vultr.com/vultr.com.100KB.bin",
};

// GCP ping endpoints (using gcping.com's global endpoints)
export const GCP_PING_ENDPOINTS: Record<string, string> = {
  "us-central1": "https://us-central1-5tkroniexa-uc.a.run.app/api/ping",
  "us-east1": "https://us-east1-5tkroniexa-ue.a.run.app/api/ping",
  "us-east4": "https://us-east4-5tkroniexa-uk.a.run.app/api/ping",
  "us-west1": "https://us-west1-5tkroniexa-uw.a.run.app/api/ping",
  "us-west2": "https://us-west2-5tkroniexa-wl.a.run.app/api/ping",
  "us-west3": "https://us-west3-5tkroniexa-wm.a.run.app/api/ping",
  "us-west4": "https://us-west4-5tkroniexa-wn.a.run.app/api/ping",
  "us-south1": "https://us-south1-5tkroniexa-rj.a.run.app/api/ping",
  "northamerica-northeast1":
    "https://northamerica-northeast1-5tkroniexa-nn.a.run.app/api/ping",
  "northamerica-northeast2":
    "https://northamerica-northeast2-5tkroniexa-pd.a.run.app/api/ping",
  "southamerica-east1":
    "https://southamerica-east1-5tkroniexa-rj.a.run.app/api/ping",
  "southamerica-west1":
    "https://southamerica-west1-5tkroniexa-tl.a.run.app/api/ping",
  "europe-west1": "https://europe-west1-5tkroniexa-ew.a.run.app/api/ping",
  "europe-west2": "https://europe-west2-5tkroniexa-nw.a.run.app/api/ping",
  "europe-west3": "https://europe-west3-5tkroniexa-ey.a.run.app/api/ping",
  "europe-west4": "https://europe-west4-5tkroniexa-ez.a.run.app/api/ping",
  "europe-west6": "https://europe-west6-5tkroniexa-oa.a.run.app/api/ping",
  "europe-west8": "https://europe-west8-5tkroniexa-oc.a.run.app/api/ping",
  "europe-west9": "https://europe-west9-5tkroniexa-od.a.run.app/api/ping",
  "europe-central2": "https://europe-central2-5tkroniexa-lm.a.run.app/api/ping",
  "europe-north1": "https://europe-north1-5tkroniexa-lz.a.run.app/api/ping",
  "europe-southwest1":
    "https://europe-southwest1-5tkroniexa-no.a.run.app/api/ping",
  "asia-east1": "https://asia-east1-5tkroniexa-de.a.run.app/api/ping",
  "asia-east2": "https://asia-east2-5tkroniexa-df.a.run.app/api/ping",
  "asia-northeast1": "https://asia-northeast1-5tkroniexa-an.a.run.app/api/ping",
  "asia-northeast2": "https://asia-northeast2-5tkroniexa-dt.a.run.app/api/ping",
  "asia-northeast3": "https://asia-northeast3-5tkroniexa-du.a.run.app/api/ping",
  "asia-south1": "https://asia-south1-5tkroniexa-el.a.run.app/api/ping",
  "asia-south2": "https://asia-south2-5tkroniexa-em.a.run.app/api/ping",
  "asia-southeast1": "https://asia-southeast1-5tkroniexa-as.a.run.app/api/ping",
  "asia-southeast2": "https://asia-southeast2-5tkroniexa-et.a.run.app/api/ping",
  "australia-southeast1":
    "https://australia-southeast1-5tkroniexa-ts.a.run.app/api/ping",
  "australia-southeast2":
    "https://australia-southeast2-5tkroniexa-km.a.run.app/api/ping",
  "me-west1": "https://me-west1-5tkroniexa-zf.a.run.app/api/ping",
  "me-central1": "https://me-central1-5tkroniexa-ww.a.run.app/api/ping",
  "africa-south1": "https://africa-south1-5tkroniexa-bq.a.run.app/api/ping",
};

export type LatencyStatus = "pending" | "measuring" | "done" | "error";

export type LatencyResult = {
  regionId: string;
  latency: number | null;
  status: LatencyStatus;
};

export type RegionWithLatency = {
  id: string;
  name: string;
  country: string;
  continent: string;
  latency: number | null;
  status: LatencyStatus;
};

async function measureSingleLatency(endpoint: string): Promise<number> {
  const samples: number[] = [];
  const numSamples = 3;

  for (let i = 0; i < numSamples; i++) {
    const start = performance.now();
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = `${endpoint}?_=${Date.now()}-${i}`;
    });
    const end = performance.now();
    samples.push(end - start);
  }

  samples.sort((a, b) => a - b);
  return Math.round(samples[Math.floor(samples.length / 2)]);
}

export function getEndpointsForProvider(
  provider: string
): Record<string, string> {
  const isGCP =
    provider === "gcp" || provider === "gcp_cloudrun" || provider === "cloud_run";
  return isGCP ? GCP_PING_ENDPOINTS : VULTR_PING_ENDPOINTS;
}

// Module-level cache for latency results (persists across component remounts)
const latencyCache = new Map<string, LatencyResult>();

function getCacheKey(provider: string, regionId: string): string {
  return `${provider}:${regionId}`;
}

export function useRegionLatency(
  regionIds: string[],
  provider: string
): Map<string, LatencyResult> {
  const [latencies, setLatencies] = React.useState<Map<string, LatencyResult>>(
    () => {
      // Initialize with cached values
      const initial = new Map<string, LatencyResult>();
      regionIds.forEach((id) => {
        const cached = latencyCache.get(getCacheKey(provider, id));
        if (cached) {
          initial.set(id, cached);
        }
      });
      return initial;
    }
  );

  React.useEffect(() => {
    if (regionIds.length === 0) return;

    // Determine which regions need measuring (not in cache)
    const regionsToMeasure: string[] = [];
    const initial = new Map<string, LatencyResult>();

    regionIds.forEach((id) => {
      const cacheKey = getCacheKey(provider, id);
      const cached = latencyCache.get(cacheKey);
      if (cached) {
        initial.set(id, cached);
      } else {
        initial.set(id, { regionId: id, latency: null, status: "pending" });
        regionsToMeasure.push(id);
      }
    });

    setLatencies(initial);

    if (regionsToMeasure.length === 0) return;

    const endpoints = getEndpointsForProvider(provider);

    const measureLatency = async (regionId: string) => {
      const endpoint = endpoints[regionId];
      const cacheKey = getCacheKey(provider, regionId);

      if (!endpoint) {
        const result: LatencyResult = {
          regionId,
          latency: null,
          status: "error",
        };
        latencyCache.set(cacheKey, result);
        setLatencies((prev) => {
          const next = new Map(prev);
          next.set(regionId, result);
          return next;
        });
        return;
      }

      setLatencies((prev) => {
        const next = new Map(prev);
        next.set(regionId, { regionId, latency: null, status: "measuring" });
        return next;
      });

      try {
        const latency = await measureSingleLatency(endpoint);
        const result: LatencyResult = { regionId, latency, status: "done" };
        latencyCache.set(cacheKey, result);
        setLatencies((prev) => {
          const next = new Map(prev);
          next.set(regionId, result);
          return next;
        });
      } catch {
        const result: LatencyResult = {
          regionId,
          latency: null,
          status: "error",
        };
        latencyCache.set(cacheKey, result);
        setLatencies((prev) => {
          const next = new Map(prev);
          next.set(regionId, result);
          return next;
        });
      }
    };

    // Start all measurements concurrently so they race fairly
    regionsToMeasure.forEach((regionId) => {
      measureLatency(regionId);
    });
  }, [regionIds, provider]);

  return latencies;
}

export function getTopRegionsByLatency<T extends { id: string }>(
  regions: T[],
  latencies: Map<string, LatencyResult>,
  count: number = 3
): T[] {
  const regionsWithLatency = regions
    .map((r) => ({
      region: r,
      latency: latencies.get(r.id)?.latency ?? Infinity,
      status: latencies.get(r.id)?.status ?? "pending",
    }))
    .filter((r) => r.status === "done" && r.latency !== Infinity)
    .sort((a, b) => a.latency - b.latency);

  return regionsWithLatency.slice(0, count).map((r) => r.region);
}

export function formatLatency(result: LatencyResult | undefined): string {
  if (!result) return "";
  switch (result.status) {
    case "pending":
    case "measuring":
      return "...";
    case "error":
      return "-";
    case "done":
      return result.latency !== null ? `${result.latency}ms` : "-";
  }
}

export function getLatencyColorClass(result: LatencyResult | undefined): string {
  if (!result || result.status !== "done" || result.latency === null) {
    return "text-muted-foreground";
  }

  if (result.latency < 100) {
    return "text-green-500";
  } else if (result.latency < 200) {
    return "text-yellow-500";
  } else {
    return "text-red-500";
  }
}
