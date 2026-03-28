import { useState, useEffect } from "react";

const SITE_URL = "https://kepler-22b.vercel.app/";

function extractTweetId(url) {
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : null;
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
    " · " +
    date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function Home() {
  const [tweetUrl, setTweetUrl] = useState("");
  const [replyText, setReplyText] = useState("");
  const [status, setStatus] = useState({ msg: "", type: "" });
  const [posting, setPosting] = useState(false);
  const [log, setLog] = useState([]);
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("kepler-reply-log");
    if (saved) {
      const parsed = JSON.parse(saved);
      setLog(parsed);
      const today = new Date().toDateString();
      const todayPosts = parsed.filter(
        (l) => new Date(l.timestamp).toDateString() === today && l.status === "posted"
      ).length;
      setTodayCount(todayPosts);
    }
  }, []);

  function saveLog(newLog) {
    setLog(newLog);
    localStorage.setItem("kepler-reply-log", JSON.stringify(newLog));
  }

  function addToLog(text, url, status) {
    const entry = {
      text,
      url,
      status,
      timestamp: new Date().toISOString(),
    };
    const newLog = [entry, ...log];
    saveLog(newLog);
    if (status === "posted") setTodayCount((c) => c + 1);
  }

  function clearLog() {
    saveLog([]);
    setTodayCount(0);
  }

  async function handlePost() {
    if (!tweetUrl.trim()) return setStatus({ msg: "Enter a tweet URL.", type: "error" });
    if (!replyText.trim()) return setStatus({ msg: "Write your reply first.", type: "error" });
    if (replyText.length > 280) return setStatus({ msg: "Reply is over 280 characters.", type: "error" });
    if (todayCount >= 17) return setStatus({ msg: "Daily limit reached (17/17). Resets tomorrow.", type: "error" });

    const tweetId = extractTweetId(tweetUrl);
    if (!tweetId) return setStatus({ msg: "Invalid tweet URL. Must contain /status/XXXXXXX", type: "error" });

    setPosting(true);
    setStatus({ msg: "Posting to X...", type: "info" });

    try {
      const res = await fetch("/api/post-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyText, tweetId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to post");

      addToLog(replyText, tweetUrl, "posted");
      setStatus({ msg: "Reply posted successfully!", type: "success" });
      setTweetUrl("");
      setReplyText("");
    } catch (err) {
      setStatus({ msg: "Error: " + err.message, type: "error" });
      addToLog(replyText, tweetUrl, "failed");
    } finally {
      setPosting(false);
    }
  }

  const charColor =
    replyText.length > 280 ? "#E24B4A" : replyText.length > 240 ? "#BA7517" : "#888780";

  const dotColor = todayCount >= 17 ? "#E24B4A" : todayCount >= 12 ? "#BA7517" : "#3B6D11";

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.header}>
          <h1 style={styles.h1}>Kepler Codes — reply bot</h1>
          <p style={styles.subtitle}>
            Write your reply, paste a tweet URL, post it to X in one click
          </p>
        </div>

        {/* Post card */}
        <div style={styles.card}>
          <p style={styles.cardTitle}>Post a reply</p>

          <label style={styles.label}>Tweet URL</label>
          <input
            style={styles.input}
            type="text"
            placeholder="https://x.com/someone/status/123456789"
            value={tweetUrl}
            onChange={(e) => setTweetUrl(e.target.value)}
          />

          <label style={{ ...styles.label, marginTop: 14 }}>Your reply</label>
          <textarea
            style={styles.textarea}
            placeholder="Hello, Kepler Codes here looking for some Web Dev, AI/ML, Cybersecurity, CP or DSA mastery. Educators with work experience at Amazon, Google, Deutsche Bank are here to teach you. Join us: https://kepler-22b.vercel.app/"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <div style={{ textAlign: "right", fontSize: 12, color: charColor, marginTop: 4 }}>
            {replyText.length} / 280
          </div>

          <div style={styles.rateBar}>
            <span style={{ ...styles.dot, background: dotColor }} />
            <span>Daily usage: <strong>{todayCount}</strong> / 17 replies posted today</span>
          </div>

          {status.msg && (
            <div style={{ ...styles.statusBox, ...styles["status_" + status.type] }}>
              {status.msg}
            </div>
          )}

          <div style={styles.row}>
            <button
              style={{ ...styles.btn, ...styles.btnPrimary, opacity: posting ? 0.5 : 1 }}
              onClick={handlePost}
              disabled={posting}
            >
              {posting ? "Posting..." : "Post reply ↗"}
            </button>
            <button
              style={styles.btn}
              onClick={() => { setTweetUrl(""); setReplyText(""); setStatus({ msg: "", type: "" }); }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Log card */}
        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ ...styles.cardTitle, margin: 0 }}>
              Reply log{" "}
              <span style={styles.badge}>
                {log.filter((l) => l.status === "posted").length} posted
              </span>
            </p>
            {log.length > 0 && (
              <button style={styles.clearBtn} onClick={clearLog}>Clear log</button>
            )}
          </div>

          {log.length === 0 ? (
            <p style={styles.empty}>No replies yet — start posting!</p>
          ) : (
            log.map((item, i) => (
              <div key={i} style={styles.logItem}>
                <div style={styles.logMeta}>
                  <span style={styles.logTime}>{formatTime(new Date(item.timestamp))}</span>
                  <span style={{
                    ...styles.logTag,
                    background: item.status === "posted" ? "#EAF3DE" : item.status === "failed" ? "#FCEBEB" : "#FAEEDA",
                    color: item.status === "posted" ? "#3B6D11" : item.status === "failed" ? "#A32D2D" : "#854F0B",
                  }}>
                    {item.status}
                  </span>
                </div>
                <p style={styles.logText}>{item.text}</p>
                <a href={item.url} target="_blank" rel="noreferrer" style={styles.logLink}>
                  View original tweet ↗
                </a>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f5f4f0", padding: "2rem 1rem", fontFamily: "system-ui, -apple-system, sans-serif" },
  container: { maxWidth: 620, margin: "0 auto" },
  header: { marginBottom: "1.5rem" },
  h1: { fontSize: 20, fontWeight: 500, color: "#2C2C2A", margin: 0 },
  subtitle: { fontSize: 13, color: "#5F5E5A", marginTop: 4 },
  card: { background: "#fff", border: "0.5px solid #D3D1C7", borderRadius: 12, padding: "1.25rem", marginBottom: "1rem" },
  cardTitle: { fontSize: 13, fontWeight: 500, color: "#2C2C2A", marginBottom: 12 },
  label: { display: "block", fontSize: 12, color: "#5F5E5A", marginBottom: 5 },
  input: { width: "100%", fontSize: 14, padding: "8px 10px", border: "0.5px solid #D3D1C7", borderRadius: 8, outline: "none", fontFamily: "inherit", boxSizing: "border-box", background: "#fff", color: "#2C2C2A" },
  textarea: { width: "100%", fontSize: 14, padding: "8px 10px", border: "0.5px solid #D3D1C7", borderRadius: 8, outline: "none", fontFamily: "inherit", boxSizing: "border-box", minHeight: 100, resize: "vertical", background: "#fff", color: "#2C2C2A" },
  rateBar: { display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#5F5E5A", background: "#F1EFE8", borderRadius: 8, padding: "7px 10px", marginTop: 12 },
  dot: { display: "inline-block", width: 7, height: 7, borderRadius: "50%", flexShrink: 0 },
  statusBox: { fontSize: 13, padding: "8px 12px", borderRadius: 8, marginTop: 10 },
  status_info: { background: "#E6F1FB", color: "#185FA5" },
  status_success: { background: "#EAF3DE", color: "#3B6D11" },
  status_error: { background: "#FCEBEB", color: "#A32D2D" },
  row: { display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" },
  btn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", fontSize: 14, fontFamily: "inherit", borderRadius: 8, cursor: "pointer", border: "0.5px solid #D3D1C7", background: "transparent", color: "#2C2C2A" },
  btnPrimary: { background: "#2C2C2A", color: "#fff", border: "none" },
  badge: { fontSize: 11, padding: "2px 8px", borderRadius: 8, background: "#F1EFE8", color: "#5F5E5A", marginLeft: 6 },
  clearBtn: { fontSize: 12, color: "#A32D2D", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0 },
  logItem: { padding: "10px 0", borderBottom: "0.5px solid #D3D1C7" },
  logMeta: { display: "flex", gap: 8, alignItems: "center", marginBottom: 4 },
  logTime: { fontSize: 11, color: "#888780" },
  logTag: { fontSize: 11, padding: "1px 7px", borderRadius: 6 },
  logText: { fontSize: 13, color: "#2C2C2A", lineHeight: 1.5, margin: 0 },
  logLink: { fontSize: 11, color: "#185FA5", display: "block", marginTop: 3 },
  empty: { textAlign: "center", padding: "2rem", color: "#888780", fontSize: 13 },
};
