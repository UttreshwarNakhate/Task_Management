/* eslint-disable @typescript-eslint/no-base-to-string */
import { createLogger, format, transports } from 'winston'
import util from 'util'
import { ConsoleTransportInstance, FileTransportInstance } from 'winston/lib/winston/transports'
import path from 'path'
import * as SourceMapSupport from 'source-map-support'
import { blue, bold, green, magenta, red, yellow } from 'colorette'
import config from '../config/config'
import { EApplicationEnvironment } from '../constants/application.constant'

// Linking trace support
SourceMapSupport.install()

// Date/time formatter (12-hour format)
const getFormattedTimestamp = (): string => {
    const now = new Date()
    const pad = (n: number) => n.toString().padStart(2, '0')
    let hours = now.getHours()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(hours)}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${ampm}`
}

// Console log format
const consoleLogFormat = format.printf((info) => {
    const { level, message, meta = {} } = info
    const customLevel = level.toUpperCase()
    const timestamp = green(getFormattedTimestamp())
    const metaString = util.inspect(meta, { showHidden: false, depth: null, colors: true })
     

    const printableMessage = typeof message === 'object' ? util.inspect(message, { depth: null, colors: true }) : message

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const baseLog = `[ ${customLevel} | [${timestamp}] | ${printableMessage} | [${magenta('META:')} ${metaString}] ]`

    switch (customLevel) {
        case 'ERROR':
            return red(bold(baseLog))
        case 'INFO':
            return blue(bold(baseLog))
        case 'WARN':
            return yellow(bold(baseLog))
        default:
            return bold(baseLog)
    }
})

// Console transport
const consoleTransport = (): Array<ConsoleTransportInstance> => {
    if (config.ENV === EApplicationEnvironment.DEVELOPMENT) {
        return [
            new transports.Console({
                level: 'info',
                format: format.combine(format.timestamp(), consoleLogFormat)
            })
        ]
    }
    return []
}

// File log format
const fileLogFormat = format.printf((info) => {
    const { level, message, timestamp, meta = {} } = info
    const logMeta: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(meta as Record<string, unknown>)) {
        logMeta[key] = value instanceof Error ? { name: value.name, message: value.message, trace: value.stack || '' } : (value as Error)
    }

    return util.inspect(
        {
            level: level.toUpperCase(),
            message,
            timestamp,
            meta: logMeta
        },
        {
            showHidden: false,
            depth: null,
            colors: false,
            compact: false
        }
    )
})

// File transport
const fileTransport = (): Array<FileTransportInstance> => [
    new transports.File({
        filename: path.join(__dirname, '../', '../', 'logs', `${config.ENV}.log`),
        level: 'info',
        format: format.combine(format.timestamp(), fileLogFormat)
    })
]

export default createLogger({
    defaultMeta: { meta: {} },
    transports: [...fileTransport(), ...consoleTransport()]
})
