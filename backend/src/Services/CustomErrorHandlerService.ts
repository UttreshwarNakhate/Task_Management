type TCustomError = Error & {
    status?: number
}

const createCustomError = (status: number, message: string): TCustomError => {
    const error = new Error(message) as TCustomError
    error.status = status
    return error
}

const customErrorHandler = {
    alreadyExist: (msg: string) => createCustomError(409, msg),

    wrongCredentials: (msg = 'Username or password is wrong!') => createCustomError(401, msg),

    unAuthorized: (msg = 'unAuthorized') => createCustomError(401, msg),

    notFound: (msg = '404 Not Found') => createCustomError(404, msg),

    serverError: (msg = 'Internal server error') => createCustomError(500, msg),

    validationFailed: (msg = 'validation failed') => createCustomError(400, msg),

    invalidPassword: (msg = 'Invalid password ') => createCustomError(401, msg),

    tokenRetuired: (msg = 'Token required ') => createCustomError(401, msg),
}

export default customErrorHandler
