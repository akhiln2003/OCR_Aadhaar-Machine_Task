import { RequestHandler, Router } from "express";

export interface IServer{
    start(port: number): Promise<void>;
    close(): Promise<void>;
    registerMiddleware(middleware: RequestHandler): void;
    registerRoutes(path: string, router: Router): void;
    registerErrorHandler(middleware: unknown): void;
}