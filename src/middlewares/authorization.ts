import { NextFunction, Request, Response } from "express";
import { JwtPayload, verify } from "jsonwebtoken";
import { SECRET } from "../global";

interface jwtPayload {
    id: string;
    name: string;
    email: string;
    role: string;
}

export const verifToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(400).json({
            message: `Kamu gada akses!`,
        });
    }

    try {
        const secretKey = SECRET || "";
        const decoded = verify(token, secretKey) as jwtPayload;

        // Simpan data user di req (bukan di body)
        (req as any).user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            message: `Token mu salah bang`,
        });
    }
};

export const verifRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;

        if (!user) {
            return res.status(403).json({
                message: `Ga ada rincian usernya bang!`,
            });
        }

        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({
                message: `Akses mu ditolak bang. 
                    Kalo mau akses, kamu butuh role: ${allowedRoles.join(", ")}`,
            });
        }

        next();
    };
};