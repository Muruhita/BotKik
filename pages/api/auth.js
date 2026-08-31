import { getDiscordToken, getDiscordUser, createToken } from '../../lib/discord';

export default async function handler(req, res) {
  const { code, error } = req.query;
  
  if (error) return res.redirect('/?error=access_denied');
  if (!code) return res.redirect('/?error=no_code');

  try {
    const tokenData = await getDiscordToken(code);
    const user = await getDiscordUser(tokenData.access_token);
    const jwtToken = createToken(user);
    
    res.setHeader('Set-Cookie', `token=${jwtToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400; Secure`);
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Auth error:', error);
    res.redirect('/?error=auth_failed');
  }
}