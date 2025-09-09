export function requireAuth(req, res, next) {
  const header = req.header('Authorization') || '';
  const match = header.match(/^Bearer\s+(demo-(\d+|[A-Za-z0-9_-]+))$/);

  if (!match) {
    return res.status(401).json({error: 'Unauthorized'});
  }

  const token = match[1];
  const userId = token.replace('demo-', '');
  req.user = {userId};
  next();
}