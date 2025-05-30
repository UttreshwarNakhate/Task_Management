import { Request, Response } from 'express'

export default (req: Request, res: Response, responseStatusCode: number, responseMessage: string, data: unknown = null): void => {
    const response = {
        success: true,
        statusCode: responseStatusCode,
        message: responseMessage,
        data: data
    }
    res.status(responseStatusCode).json(response)
}
