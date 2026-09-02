export default function handler(req, res) {
  res.setHeader('Set-Cookie', 'token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure');
  res.status(200).json({ success: true });
}