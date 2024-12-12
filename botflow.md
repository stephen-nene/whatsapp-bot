1. send a message to bot and it starts you a session and asks for reg number
2. we check that reg number and its its

```js
// user sends bot a message
const userSesion = {}
const registeredUsers = [
  {
    id: "1234a",
    name: 'steve',
    email: "stevenene@gmail.com",
    status: "Failed",
    results: [
      {
        food: "Tomato Sauce",
        testType: "Microbial Analysis",
        submissionDate: "2024-11-15",
        completionDate: "2024-11-18",
        sentDate: "2024-11-19",
        result: {
          salmonella: "Absent",
          eColi: "Present",
          yeastMoldCount: "High",
        },
      },
    ],
  },
]

function handleIncomingMessage async (req, res){
    const response = await req.body
    if(response.AccountSid === userSesion.AccountSid.any? ){
        userSession.status === "awaiting reg-num"
        userSession.AccountSid = response.AccountSid
    }
    case "awaiting reg-num":
        const regNumber = response.trim();
        if (regNumber = registeredUsers.any?){
            userSession.status === "processing payment"
            twilioResponse.send(`acknowledgment message to the ${registered user}`)
        }else{
            userSession.status === "awaiting reg-num"
            twilioResponse.send(`wrong registration number, please try again`)
        }
    case "processing payment":
        const data = response.trim();
        twilioResponse.send(`processing payment . an mpesa STK has been initiated for number ${userSession.}`)
        const mpesares = mpesaSTKpusher(userSession[response.FromNumber].number,1)
        // at the mpesa callabck send the resonse to user
    case "payment done":
        twilioResponse.send("Thanks for the payment:")
        twilioResponse.send(`User medical results: ${registeredUser[response.AccountSid]}`)
}


```
