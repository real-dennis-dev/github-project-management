class IntegrationUtils {
  // Makes external API call
  async callExternalAPI(config) {
    const {
      url,
      method = "GET",
      headers = {},
      body = null,
      timeout = 30000,
      retries = 3,
    } = config;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        signal: controller.signal,
        ...(body && { body: JSON.stringify(body) }),
      };

      const response = await fetch(url, options);
      clearTimeout(timeoutId);

      const data = await response.json();

      return {
        success: response.ok,
        statusCode: response.status,
        data,
        headers: response.headers,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Request timeout",
          statusCode: 408,
        };
      }

      return {
        success: false,
        error: error.message,
        statusCode: 500,
      };
    }
  }

  // Handles rate limiting
  handleRateLimiting(req) {
    const ip = req.ip || req.connection.remoteAddress;
    const route = req.route?.path || req.url;
    const key = `rate:${ip}:${route}`;

    // This would integrate with your cache/redis
    // Implementation using Redis is shown in cache utils

    return {
      key,
      ip,
      route,
      limit: 100,
      window: 60, // seconds
    };
  }

  // Retries failed operations
  async retryOperation(fn, maxRetries = 3, delay = 1000) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff
        const waitTime = delay * Math.pow(2, attempt - 1);
        console.log(
          `Retry attempt ${attempt} failed. Retrying in ${waitTime}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    throw lastError;
  }

  // Handles webhook events
  webhookHandler(event) {
    return {
      id: `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      event,
      receivedAt: new Date().toISOString(),
      processed: false,
      retries: 0,
    };
  }

  // Validates webhook signature
  validateWebhookSignature(signature, payload, secret) {
    // Implementation depends on webhook provider
    // For example, GitHub uses HMAC-SHA256
    try {
      const crypto = require("crypto");
      const hash = crypto
        .createHmac("sha256", secret)
        .update(JSON.stringify(payload))
        .digest("hex");

      const expectedSignature = `sha256=${hash}`;
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      return false;
    }
  }
}

module.exports = new IntegrationUtils();
