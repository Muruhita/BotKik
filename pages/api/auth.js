import { getDiscordToken, getDiscordUser, createToken } from '../../lib/discord';

export default async function handler(req, res) {
  const { code, error } = req.query;
  
  if (error) return res.redirect('/?error=access_denied');
  if (!code) return res.redirect('/?error=no_code');

  try {
    const tokenData = await getDiscordToken(code);
    const user = await getDiscordUser(tokenData.access_token);
    const jwtToken = createToken(user);
    
    // Для локальной разработки убираем Secure, для продакшена оставляем
    const isLocal = process.env.NODE_ENV === 'development';
    const secureFlag = isLocal ? '' : '; Secure';
    
    res.setHeader('Set-Cookie', `token=${jwtToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${secureFlag}`);
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Auth error:', error);
    res.redirect('/?error=auth_failed');
  }
}