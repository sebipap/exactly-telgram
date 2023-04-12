import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'

export function getButtons(buttons: InlineKeyboardButton[]) {
  return {
    reply_markup: {
      inline_keyboard: [buttons],
    },
  }
}
