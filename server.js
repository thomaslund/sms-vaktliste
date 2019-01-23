var express = require('express');
var bodyParser = require('body-parser');
const path = require('path');
var ics = require('ics');

const createIcsEvents = eventData => {
  const { error, value } = ics.createEvents(eventData);
  if (error) {
    console.log(error);
    return error;
  }
  return value;
};

const app = express();
app.use(bodyParser.json()); // add a middleware (so that express can parse request.body's json)

app.use(express.static(path.join(__dirname, 'build')));

if (!process.env.DEV) {
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

var jsonParser = bodyParser.json();
app.post('/api/calender', jsonParser, (request, response) => {
  const res = createIcsEvents(request.body);
  response.json(res);
});

console.log(`Serving app from port ${process.env.PORT || 8000}`);
app.listen(process.env.PORT || 8000);
