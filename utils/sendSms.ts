/*
const https = require("https");

/**
 * Send an SMS using the RapidAPI sms-verify3 service.
 * @param phone The recipient's phone number (e.g. '+21699900001')
 * @param message Optional message (not used by this API, but kept for compatibility)
 * @returns Promise with the API response
 */
/*
export function sendSms(phone: string, message?: string): Promise<any> {
  const options = {
    method: "POST",
    hostname: "sms-verify3.p.rapidapi.com",
    port: null,
    path: "/send-numeric-verify",
    headers: {
      "x-rapidapi-key":
        process.env.RAPIDAPI_KEY || "3f681a6784msh9aa7d4a96b56a70p12b20djsn96a6b735c9f5",
      "x-rapidapi-host": "sms-verify3.p.rapidapi.com",
      "Content-Type": "application/json",
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, function (res: any) {
      const chunks: any[] = [];

      res.on("data", function (chunk: any) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        const body = Buffer.concat(chunks);
        try {
          resolve(JSON.parse(body.toString()));
        } catch (e) {
          resolve(body.toString());
        }
      });
    });

    req.on("error", (err: any) => reject(err));
    if (!phone.startsWith("+216")) {
      phone = "+216" + phone;
    }
    req.write(JSON.stringify({ target: phone }));
    req.end();
  });
}
*/