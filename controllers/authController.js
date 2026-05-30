const crypto = require("crypto");
const supabase = require("../services/supabaseService");
const { sendToDevice } = require("../services/firebaseService");

// =========================
// MEMORY STORAGE (SESSION)
// =========================
let currentPassword = null;
const activeTokens = new Map();

// =========================
// GENERATE PASSWORD (FCM PUSH)
// =========================
exports.generatePassword = async (req, res) => {
  try {
    // 1. 새 패스워드 생성
    currentPassword = crypto.randomBytes(4).toString("hex");

    // 2. admin 목록 조회
    const { data: admins, error } = await supabase
      .from("users")
      .select(
        `
          id,
          name,
          device_tokens (
            token
          )
        `,
      )
      .eq("role", "admin");

    if (error) throw error;

    // 3. FCM PUSH 전송
    for (const admin of admins || []) {
      const token = admin.device_tokens?.[0]?.token;
      if (!token) continue;

      await sendToDevice({
        message: {
          token,
          data: {
            title: "ADMIN PASSWORD",
            body: `Password: ${currentPassword}`,
            level: "3",
          },
          android: {
            priority: "high",
          },
        },
      });
    }

    return res.json({
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================
// VERIFY PASSWORD (LOGIN)
// =========================
exports.verifyPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "password required",
      });
    }

    // 1. password check
    if (password !== currentPassword) {
      return res.status(401).json({
        success: false,
        message: "invalid password",
      });
    }

    // 2. session token 생성 (FCM guard 핵심)
    const token = crypto.randomBytes(24).toString("hex");

    activeTokens.set(token, {
      createdAt: Date.now(),
    });

    return res.json({
      success: true,
      token,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================
// VERIFY SESSION (FCM GUARD)
// =========================
exports.verifySession = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "no token",
      });
    }

    const session = activeTokens.get(token);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "invalid session",
      });
    }

    // optional: 만료 처리 (24h)
    const expired = Date.now() - session.createdAt > 24 * 60 * 60 * 1000;

    if (expired) {
      activeTokens.delete(token);

      return res.status(401).json({
        success: false,
        message: "session expired",
      });
    }

    return res.json({
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
