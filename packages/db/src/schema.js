"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsEvents = exports.cohortMembers = exports.cohorts = exports.userProgress = exports.userSessions = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    passwordHash: (0, pg_core_1.varchar)("password_hash", { length: 255 }),
    emailVerified: (0, pg_core_1.boolean)("email_verified").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
exports.userSessions = (0, pg_core_1.pgTable)("user_sessions", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    token: (0, pg_core_1.varchar)("token", { length: 512 }).notNull().unique(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.userProgress = (0, pg_core_1.pgTable)("user_progress", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    templateId: (0, pg_core_1.varchar)("template_id", { length: 100 }).notNull(),
    completed: (0, pg_core_1.boolean)("completed").default(false),
    timeSpentSeconds: (0, pg_core_1.integer)("time_spent_seconds").default(0),
    linesExplained: (0, pg_core_1.integer)("lines_explained").default(0),
    lastAccessedAt: (0, pg_core_1.timestamp)("last_accessed_at").defaultNow(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
exports.cohorts = (0, pg_core_1.pgTable)("cohorts", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    name: (0, pg_core_1.varchar)("name", { length: 200 }).notNull(),
    description: (0, pg_core_1.varchar)("description", { length: 1000 }),
    inviteCode: (0, pg_core_1.varchar)("invite_code", { length: 64 }).notNull().unique(),
    createdBy: (0, pg_core_1.uuid)("created_by").references(() => exports.users.id, { onDelete: "set null" }),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
exports.cohortMembers = (0, pg_core_1.pgTable)("cohort_members", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    cohortId: (0, pg_core_1.uuid)("cohort_id").references(() => exports.cohorts.id, { onDelete: "cascade" }).notNull(),
    userId: (0, pg_core_1.uuid)("user_id").references(() => exports.users.id, { onDelete: "set null" }),
    email: (0, pg_core_1.varchar)("email", { length: 255 }),
    role: (0, pg_core_1.varchar)("role", { length: 20 }).default("student").notNull(),
    joinedAt: (0, pg_core_1.timestamp)("joined_at").defaultNow().notNull(),
});
exports.analyticsEvents = (0, pg_core_1.pgTable)("analytics_events", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)("user_id").references(() => exports.users.id, { onDelete: "set null" }),
    cohortId: (0, pg_core_1.uuid)("cohort_id").references(() => exports.cohorts.id, { onDelete: "set null" }),
    sessionId: (0, pg_core_1.varchar)("session_id", { length: 128 }).notNull(),
    templateId: (0, pg_core_1.varchar)("template_id", { length: 100 }),
    event: (0, pg_core_1.varchar)("event", { length: 100 }).notNull(),
    stepId: (0, pg_core_1.varchar)("step_id", { length: 100 }),
    success: (0, pg_core_1.boolean)("success"),
    durationMs: (0, pg_core_1.integer)("duration_ms"),
    metadata: (0, pg_core_1.jsonb)("metadata"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
