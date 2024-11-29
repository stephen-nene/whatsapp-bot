import twilio from 'twilio';
const { MessagingResponse } = twilio;


export const handleIncomingMessage = (req, res) => {
  const twiml = new MessagingResponse();

  const message = req.body.Body;
  twiml.message(`You said: ${message}`);

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
};
