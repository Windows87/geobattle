const generateRandomNumber = () => {
  const date = new Date();
  const dateTime = date.getTime();
  return Math.round(Math.random() * dateTime);
}

module.exports = generateRandomNumber;