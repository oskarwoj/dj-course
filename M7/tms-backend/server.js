require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3030;

app.listen(PORT, () => {
  console.log(`TMS Backend running on port ${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
});
