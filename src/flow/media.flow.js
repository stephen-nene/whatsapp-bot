import { addKeyword,utils } from "@builderbot/bot";
import { join } from "path";


export const fullSamplesFlow = addKeyword([
  "samples",
  utils.setEvent("SAMPLES"),
])
  .addAnswer(`💪 I'll send you a lot of files...`)
  .addAnswer(`Send image from Local`, {
    media: join(process.cwd(), "assets", "sample.png"),
  })
  .addAnswer(`Send video from URL`, {
    media:
      "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTJ0ZGdjd2syeXAwMjQ4aWdkcW04OWlqcXI3Ynh1ODkwZ25zZWZ1dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LCohAb657pSdHv0Q5h/giphy.mp4",
  })
  .addAnswer(`Send audio from URL`, {
    media: "https://cdn.freesound.org/previews/728/728142_11861866-lq.mp3",
  })
  .addAnswer(`Send file from URL`, {
    media:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  });


  export const registerFlow = addKeyword(utils.setEvent("REGISTER_FLOW"))
    .addAnswer(
      `What is your name?`,
      { capture: true },
      async (ctx, { state }) => {
        await state.update({ name: ctx.body });
      }
    )
    .addAnswer(
      "What is your age?",
      { capture: true },
      async (ctx, { state }) => {
        await state.update({ age: ctx.body });
      }
    )
    .addAction(async (_, { flowDynamic, state }) => {
      await flowDynamic(
        `${state.get(
          "name"
        )}, thanks for your information!: Your age: ${state.get("age")}`
      );
    });
