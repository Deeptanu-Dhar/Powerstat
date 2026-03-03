/**
 * sessionMiddleware
 *
 * Reads the `x-session-id` header sent by the client and attaches it to
 * `req.sessionId`. The ID is generated once on the client (uuid v4) and
 * stored in localStorage — the server never generates or modifies it.
 *
 * If the header is absent the request is rejected with 400 so callers
 * always have a meaningful session reference.
 */
export function sessionMiddleware(req, res, next) {
  const sessionId = req.headers['x-session-id'];

  if (!sessionId) {
    return res.status(400).json({ error: 'Missing x-session-id header.' });
  }

  req.sessionId = sessionId;
  next();
}
