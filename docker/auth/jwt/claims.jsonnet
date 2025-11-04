local claims = std.extVar('claims');
local session = std.extVar('session');

{
  claims: {
    // Standard claims
    jti: claims.jti,
    iss: claims.iss,
    exp: claims.exp,
    sub: claims.sub,  // Identity ID
    sid: claims.sid,  // Session ID
    nbf: claims.nbf,
    iat: claims.iat,
    
    // Add full session data
    session: session,
  }
}