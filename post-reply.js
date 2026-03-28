import OAuth from "oauth-1.0a";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { replyText, tweetId } = req.body;

  if (!replyText || !tweetId) {
    return res.status(400).json({ error: "Missing replyText or tweetId" });
  }

  if (replyText.length > 280) {
    return res.status(400).json({ error: "Reply exceeds 280 characters" });
  }

  const oauth = OAuth({
    consumer: {
      key: process.env.X_API_KEY,
      secret: process.env.X_API_SECRET,
    },
    signature_method: "HMAC-SHA1",
    hash_function(base_string, key) {
      return crypto
        .createHmac("sha1", key)
        .update(base_string)
        .digest("base64");
    },
  });

  const token = {
    key: process.env.X_ACCESS_TOKEN,
    secret: process.env.X_ACCESS_SECRET,
  };

  const endpoint = "https://api.twitter.com/2/tweets";

  const requestData = {
    url: endpoint,
    method: "POST",
  };

  const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: replyText,
        reply: {
          in_reply_to_tweet_id: tweetId,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("X API error:", data);
      return res.status(response.status).json({
        error: data?.detail || data?.title || "X API error",
      });
    }

    return res.status(200).json({
      success: true,
      tweetId: data?.data?.id,
    });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
