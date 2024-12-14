import { join } from 'path'
import { createBot, createProvider, createFlow, addKeyword, utils } from '@builderbot/bot'
import { JsonFileDB as Database } from '@builderbot/database-json'
import { TwilioProvider as Provider } from '@builderbot/provider-twilio'
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT ?? 3008
const SID = process.env.TWILIO_ACCOUNT_SID;

console.log(`SID: ${SID}`);

const discordFlow = addKeyword('doc').addAnswer(
    ['You can see the documentation here', '📄 https://builderbot.app/docs \n', 'Do you want to continue? *yes*'].join(
        '\n'
    ),
    { capture: true },
    async (ctx, { gotoFlow, flowDynamic }) => {
        if (ctx.body.toLocaleLowerCase().includes('yes')) {
            return gotoFlow(registerFlow)
        }
        await flowDynamic('Thanks!')
        return
    }
)
const TEMPLATE_SID = "HXb5b62575e6e4ff6129ad7c8efe1f983e"; // Correct SID of the template

const fallbackFlow = addKeyword("").addAnswer(async (ctx) => {
  const date = "12/1"; // Example date
  const time = "3pm"; // Example time

  try {
    // Send the template message with content SID
    await ctx.sendText("", {
      contentSid: TEMPLATE_SID, // The SID of the approved Twilio template
      contentVariables: {
        1: date, // Replace {{1}} in the template with the date
        2: time, // Replace {{2}} in the template with the time
      },
    });
  } catch (error) {
    console.error("Error sending template message:", error);
    await ctx.sendText(
      "Sorry, there was an issue with sending your message. Please try again later."
    );
  }
});




//     addAnswer(
//   "Content template SID\nHX16ae66098d8c0505c394047c50e188cf",
//   { contentSid: "HX16ae66098d8c0505c394047c50e188cf" }
// );


const welcomeFlow = addKeyword(['hi', 'hello', 'hola'])
    .addAnswer(`🙌 Hello welcome to this *Chatbot*`)
    .addAnswer(
        [
            'I share with you the following links of interest about the project',
            '👉 *doc* to view the documentation',
        ].join('\n'),
        { delay: 800, capture: true },
        async (ctx, { fallBack }) => {
            if (!ctx.body.toLocaleLowerCase().includes('doc')) {
                console.log(`CTX: ${JSON.stringify(ctx, null, 2)}`);

                return fallBack('You should type *doc*')
            }
            return
        },
        [discordFlow]
    )

const registerFlow = addKeyword(utils.setEvent('REGISTER_FLOW'))
    .addAnswer(`What is your name?`, { capture: true }, async (ctx, { state }) => {
console.log(`CTX: ${JSON.stringify(ctx, null, 2)}`);


        await state.update({ name: ctx.body })
    })
    .addAnswer('What is your age?', { capture: true }, async (ctx, { state }) => {
        console.log(ctx)
        await state.update({ age: ctx.body })
    })
    .addAction(async (_, { flowDynamic, state }) => {
        await flowDynamic(`${state.get('name')}, thanks for your information!: Your age: ${state.get('age')}`)
    })

const fullSamplesFlow = addKeyword(['samples', utils.setEvent('SAMPLES')])
    .addAnswer(`💪 I'll send you a lot files...`)
    .addAnswer(`Send image from Local`, { media: join(process.cwd(), 'assets', 'sample.png') })
    .addAnswer(`Send video from URL`, {
        media: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTJ0ZGdjd2syeXAwMjQ4aWdkcW04OWlqcXI3Ynh1ODkwZ25zZWZ1dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LCohAb657pSdHv0Q5h/giphy.mp4',
    })
    .addAnswer(`Send audio from URL`, { media: 'https://cdn.freesound.org/previews/728/728142_11861866-lq.mp3' })
    .addAnswer(`Send file from URL`, {
        media: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    })


const main = async () => {
    const adapterFlow = createFlow([welcomeFlow, registerFlow, fullSamplesFlow,fallbackFlow])
    const adapterProvider = createProvider(Provider, {
      accountSid: SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      vendorNumber: process.env.TWILIO_WHATSAPP_NUMBER,
    });
    // 323aca09dc4f8a2619e8a59702602187
    
    const adapterDB = new Database({ filename: 'db.json' })

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    adapterProvider.server.post(
        '/v1/messages',
        handleCtx(async (bot, req, res) => {
            const { number, message, urlMedia } = req.body
            await bot.sendMessage(number, message, { media: urlMedia ?? null })
            return res.end('sended')
        })
    )

    adapterProvider.server.post(
        '/v1/register',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('REGISTER_FLOW', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/samples',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('SAMPLES', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/blacklist',
        handleCtx(async (bot, req, res) => {
            const { number, intent } = req.body
            if (intent === 'remove') bot.blacklist.remove(number)
            if (intent === 'add') bot.blacklist.add(number)

            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ status: 'ok', number, intent }))
        })
    )

    httpServer(+PORT)
}

main()
