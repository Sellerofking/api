module.exports = async function handler(req, res) {
    const urlPath = req.headers['x-invoke-path'] || req.url;
    const method = req.method;
    const targetBaseUrl = "https://api.storytv.asia";

    res.setHeader('Content-Type', 'application/json; charset=UTF-8');

    // ==========================================
    // RULE 1: Stealth Mode (Ban Prevention)
    // ==========================================
    if (urlPath.includes('/feedservice/v1/shows/watched')) {
        return res.status(200).json({ code: 200, message: "Updated lastwatched", data: null });
    }
    const isAnalyticsUrl = urlPath.includes('/heartbeat') || urlPath.includes('/impression') || urlPath.includes('/analytics');
    if (isAnalyticsUrl) {
        return res.status(200).json({ status: 200, message: "SUCCESS", data: null });
    }

    // ==========================================
    // RULE 2: Mock token generation & device registration
    // ==========================================
    if (urlPath.includes('/jwt/generate')) {
        return res.status(200).json({
            code: 200,
            message: "Success",
            data: {
                token: "eyJhbGciOiJIUzI1NiJ9.eyJjcmVhdGVkRGF0ZSI6IkZyaSBKdWwgMzEgMTY6MTY6MTIgVVRDIDIwMjYiLCJzZXNzaW9uSWQiOiIxNzkzODYyNjEiLCJkZXZpY2VJZCI6IjAzZTYxYzcxY2Q4NDk4YzEiLCJzdWIiOiIxMzI2MTA1MDkiLCJleHAiOjE3ODU3NzM3NzJ9.xdhoOlKzbsa-T7OqfQsyN-m2vR1yXuhBjjfWXz8BWK0"
            }
        });
    }
    if (urlPath.includes('/device/ids')) {
        return res.status(200).json({ 
            code: 200, 
            message: "Success", 
            data: { 
                deviceId: "37e1872a9743cd34" 
            } 
        });
    }

    // ==========================================
    // RULE 3: BRANDING FUNCTION [ 001 ]
    // ==========================================
    const apply001Branding = (obj) => {
        const brandTag = "";
        const targetKeys = ['title', 'name', 'drama_name', 'text', 'language'];
        if (typeof obj === 'object' && obj !== null) {
            for (let key in obj) {
                if (typeof obj[key] === 'string' && targetKeys.includes(key)) {
                    let cleaned = obj[key].replace(/\[.*?\]/g, '').trim();
                    if (!cleaned.includes('001')) {
                        obj[key] = cleaned + brandTag;
                    } else {
                        obj[key] = cleaned;
                    }
                } else if (typeof obj[key] === 'object') {
                    apply001Branding(obj[key]);
                }
            }
        }
    };

    // ==========================================
    // RULE 4: STRING REPLACEMENT (Renew now → Pro User)
    // ==========================================
    const applyStringReplacements = (obj) => {
        // Sirf "Renew now" ko "Pro User" mein replace karega
        const replacements = {
            'Renew now': 'Enjoy buddy!',
            'Premium Plan': 'Premium User',
            'Valid till: 23rd June, 2026': '🚨THIS IS TESTING VERSION ',
        };
        
        if (typeof obj === 'object' && obj !== null) {
            for (let key in obj) {
                if (typeof obj[key] === 'string') {
                    let str = obj[key];
                    // Sabhi replacements apply karo
                    for (const [search, replace] of Object.entries(replacements)) {
                        str = str.split(search).join(replace);
                    }
                    obj[key] = str;
                } else if (Array.isArray(obj[key])) {
                    // Array ke andar strings ko bhi replace karo
                    obj[key].forEach((item, index) => {
                        if (typeof item === 'string') {
                            let str = item;
                            for (const [search, replace] of Object.entries(replacements)) {
                                str = str.split(search).join(replace);
                            }
                            obj[key][index] = str;
                        } else if (typeof item === 'object' && item !== null) {
                            applyStringReplacements(item);
                        }
                    });
                } else if (typeof obj[key] === 'object') {
                    applyStringReplacements(obj[key]);
                }
            }
        }
    };

    // ==========================================
    // REAL PREMIUM ACCOUNT (Device Identity)
    // ==========================================
    const DEVICE_IDENTITY = {
        deviceId: "37e1872a9743cd34",
        bearerToken: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJjcmVhdGVkRGF0ZSI6IkZyaSBKdWwgMzEgMTY6MTY6MTIgVVRDIDIwMjYiLCJzZXNzaW9uSWQiOiIxNzkzODYyNjEiLCJkZXZpY2VJZCI6IjAzZTYxYzcxY2Q4NDk4YzEiLCJzdWIiOiIxMzI2MTA1MDkiLCJleHAiOjE3ODU3NzM3NzJ9.xdhoOlKzbsa-T7OqfQsyN-m2vR1yXuhBjjfWXz8BWK0",
        os: "Android 15 (API 33)",
        platform: "0",
        appVersion: "126",
        userAgent: "ktor-client/2.3.0 Android",
        fixedIp: "122.168.2.40",
        macAddress: "02:00:00:00:00:01",
        androidId: "37e1872a9743cd34",
        deviceName: "SM-G998B",
        manufacturer: "Samsung",
        model: "SM-G998B",
        language: "hi_IN",
        timezone: "Asia/Kolkata",
        screenSize: "1080x2400",
        networkType: "WIFI"
    };

    try {
        const targetUrl = targetBaseUrl + urlPath;

        // Build headers from incoming request
        const headers = { ...req.headers };
        headers['host'] = 'api.storytv.asia';
        delete headers['accept-encoding'];
        delete headers['content-length'];

        // ==========================================
        // 🔥 COMPLETE DEVICE SPOOFING - ALL IDENTIFYING HEADERS
        // ==========================================
        
        // Primary Device Headers
        headers['deviceid'] = DEVICE_IDENTITY.deviceId;
        headers['device-id'] = DEVICE_IDENTITY.deviceId;
        headers['x-device-id'] = DEVICE_IDENTITY.deviceId;
        headers['android-id'] = DEVICE_IDENTITY.androidId;
        headers['x-android-id'] = DEVICE_IDENTITY.androidId;
        
        // Authorization
        const isMockedEndpoint = urlPath.includes('/jwt/generate') ||
                                 urlPath.includes('/device/ids') ||
                                 urlPath.includes('/feedservice/v1/shows/watched') ||
                                 isAnalyticsUrl;
        
        if (!isMockedEndpoint) {
            headers['authorization'] = DEVICE_IDENTITY.bearerToken;
        }
        
        // OS & App Headers
        headers['os'] = DEVICE_IDENTITY.os;
        headers['platform'] = DEVICE_IDENTITY.platform;
        headers['appversion'] = DEVICE_IDENTITY.appVersion;
        headers['app-version'] = DEVICE_IDENTITY.appVersion;
        headers['x-app-version'] = DEVICE_IDENTITY.appVersion;
        
        // User Agent
        headers['user-agent'] = DEVICE_IDENTITY.userAgent;
        headers['x-user-agent'] = DEVICE_IDENTITY.userAgent;
        
        // IP Spoofing (All possible IP headers)
        headers['x-forwarded-for'] = DEVICE_IDENTITY.fixedIp;
        headers['x-real-ip'] = DEVICE_IDENTITY.fixedIp;
        headers['x-client-ip'] = DEVICE_IDENTITY.fixedIp;
        headers['x-original-forwarded-for'] = DEVICE_IDENTITY.fixedIp;
        headers['cf-connecting-ip'] = DEVICE_IDENTITY.fixedIp;
        headers['true-client-ip'] = DEVICE_IDENTITY.fixedIp;
        
        // Device Info Headers
        headers['x-device-name'] = DEVICE_IDENTITY.deviceName;
        headers['x-manufacturer'] = DEVICE_IDENTITY.manufacturer;
        headers['x-model'] = DEVICE_IDENTITY.model;
        headers['x-mac-address'] = DEVICE_IDENTITY.macAddress;
        
        // Locale & Timezone
        headers['accept-language'] = DEVICE_IDENTITY.language;
        headers['x-timezone'] = DEVICE_IDENTITY.timezone;
        headers['x-locale'] = DEVICE_IDENTITY.language;
        
        // Network Headers
        headers['x-network-type'] = DEVICE_IDENTITY.networkType;
        headers['x-screen-size'] = DEVICE_IDENTITY.screenSize;
        
        // Timestamp (consistent format)
        const ts = Math.floor(Date.now() / 1000).toString();
        headers['ts'] = ts;
        headers['x-timestamp'] = ts;
        headers['x-request-time'] = new Date().toISOString();
        
        // Content Headers
        headers['accept'] = 'application/json';
        headers['accept-charset'] = 'UTF-8';
        headers['content-type'] = 'application/json';
        headers['accept-encoding'] = 'gzip, deflate';
        
        // Session Consistency
        headers['sessionid'] = "157547089";
        headers['x-session-id'] = "157547089";
        headers['userid'] = "119298437";
        headers['x-user-id'] = "119298437";

        // ==========================================
        // REMOVE ALL TRACEABLE/VERCEL HEADERS
        // ==========================================
        const headersToRemove = [
            'x-request-id',
            'x-b3-traceid',
            'x-b3-spanid',
            'x-b3-parentspanid',
            'x-b3-sampled',
            'x-b3-flags',
            'x-cloud-trace-context',
            'x-vercel-',
            'x-forwarded-host',
            'x-forwarded-proto',
            'x-forwarded-port',
            'x-forwarded-server',
            'x-original-host',
            'x-real-host',
            'x-vercel-deployment-url',
            'x-vercel-id',
            'x-vercel-proxy',
            'x-vercel-ip-country',
            'x-vercel-ip-city',
            'x-vercel-ip-latitude',
            'x-vercel-ip-longitude',
            'x-vercel-ip-country-region',
            'x-vercel-ip-continent',
            'x-vercel-ip-timezone',
            'x-vercel-ip-as',
            'x-vercel-ip-asn',
            'x-vercel-ip-org',
            'x-vercel-proxied',
            'x-vercel-skip',
            'x-vercel-cache',
            'x-vercel-preview',
            'x-vercel-protection',
            'x-vercel-security',
            'x-vercel-tls',
            'x-vercel-http',
            'x-vercel-request-id',
            'x-vercel-request-time',
            'x-vercel-request-count',
            'x-vercel-proxy-request',
            'x-vercel-env',
            'x-vercel-region',
            'x-vercel-runtime',
            'x-vercel-architecture',
            'x-vercel-function',
            'x-vercel-dpl',
            'x-vercel-deployment',
            'x-vercel-project',
            'x-vercel-team',
            'x-vercel-user',
            'x-vercel-token',
            'x-vercel-session',
            'x-vercel-edge',
            'x-vercel-edge-request',
            'x-vercel-edge-location',
            'x-vercel-edge-ip',
            'x-vercel-edge-region',
            'x-vercel-edge-city',
            'x-vercel-edge-country'
        ];

        headersToRemove.forEach(key => {
            Object.keys(headers).forEach(header => {
                if (header.toLowerCase().startsWith(key.toLowerCase()) || header.toLowerCase() === key.toLowerCase()) {
                    delete headers[header];
                }
            });
        });

        const fetchOptions = {
            method: method,
            headers: headers,
        };
        
        if (method !== 'GET' && method !== 'HEAD' && req.body) {
            fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        }

        const response = await fetch(targetUrl, fetchOptions);
        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            let data = await response.json();
            
            // Pehle string replacements apply karo
            applyStringReplacements(data);
            
            // Phir 001 branding apply karo
            apply001Branding(data);
            
            return res.status(response.status).json(data);
        } else {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            response.headers.forEach((value, key) => {
                if (key !== 'content-encoding' && key !== 'content-length') {
                    res.setHeader(key, value);
                }
            });
            return res.status(response.status).send(buffer);
        }

    } catch (error) {
        return res.status(500).json({ code: 500, message: "Proxy Error: " + error.message });
    }
};
