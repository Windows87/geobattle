const apiController = {};

apiController.get = (req, res) => res.json({ name: 'GeoBattle API', version: '1.0.0' });

module.exports = apiController;