import jwt from 'jsonwebtoken';

export async function getDiscordToken(code) {
  const response = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI,
      scope: 'identify'
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get token: ${errorText}`);
  }
  
  return response.json();
}

export async function getDiscordUser(accessToken) {
  const response = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  if (!response.ok) {
    throw new Error('Failed to get user');
  }
  
  return response.json();
}

export function createToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      avatar: user.avatar,
      discriminator: user.discriminator || '0'
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}