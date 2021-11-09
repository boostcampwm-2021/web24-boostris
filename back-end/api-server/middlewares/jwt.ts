import jwt from 'jsonwebtoken';

function authenticateToken(req, res, next) {
  try {
    const token = req.cookies.user;
    if (token == null) return res.sendStatus(401);
    else if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY as string, (err: any, user: any) => {
        if (err) return res.sendStatus(403);

        req.user = user;

        next();
      });
    }
  } catch (error) {
    return res.sendStatus(403);
  }
}
