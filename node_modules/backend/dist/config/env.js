"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
const path_1 = __importDefault(require("path"));
// Load environment variables from the root of backend folder
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().default(5000),
    DATABASE_URL: zod_1.z.string().url(),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment configuration:', JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
}
exports.env = parsed.data;
