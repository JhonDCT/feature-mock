const enabled = !process.env.NO_COLOR && (Boolean(process.env.FORCE_COLOR) || process.stdout.isTTY)

const wrap = (open: number, close: number) => (text: string): string =>
    enabled ? `\x1b[${open}m${text}\x1b[${close}m` : text

export const bold = wrap(1, 22)
export const dim = wrap(2, 22)
export const red = wrap(31, 39)
export const green = wrap(32, 39)
export const yellow = wrap(33, 39)
export const blue = wrap(34, 39)
export const magenta = wrap(35, 39)
export const cyan = wrap(36, 39)
