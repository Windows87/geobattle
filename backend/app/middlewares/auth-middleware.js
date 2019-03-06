const ip = require('ip');

const authMiddleware = (req, res, next) => {
  const reqIp = req.ip;
  const serverIp = ip.address();  

  if(reqIp === '::1' || `::ffff:${serverIp}` === reqIp)
  	return next();

  res.status(403).json({ message: 'You are not authenticated' });
}

module.exports = () => authMiddleware;