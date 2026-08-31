"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const health_service_1 = require("./health.service");
class HealthController {
    healthService = new health_service_1.HealthService();
    getHealth = async (_req, res) => {
        try {
            await this.healthService.checkDatabase();
            res.json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                db: 'connected',
            });
        }
        catch (error) {
            res.status(500).json({
                status: 'error',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                db: 'disconnected',
                error: error instanceof Error ? error.message : 'Unknown database error',
            });
        }
    };
}
exports.HealthController = HealthController;
