import geoip from "geoip-lite";

export const getIpCountryCode = (ip) => {
    const cleanIp = String(ip || "").replace(/^::ffff:/, "");
    return geoip.lookup(cleanIp)?.country || "UNKNOWN";
};
