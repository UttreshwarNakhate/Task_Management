import { Request, Response, NextFunction } from 'express';

export const logger = (req: Request, res: Response, next: NextFunction) =>{
    console.log(`Request Method is: ${req.method} and url is ${req.url} `);
    next() // call the next middleware
}