import { pgTable, serial, varchar, boolean, timestamp, text, integer, real, jsonb, primaryKey, pgEnum } from 'drizzle-orm/pg-core';

export const systemHealth = pgTable('system_health', {
  id: serial('id').primaryKey(),
  status: varchar('status', { length: 256 }).notNull(),
  checkedAt: timestamp('checked_at').defaultNow().notNull(),
});
export type SystemHealth = typeof systemHealth.$inferSelect;
export type NewSystemHealth = typeof systemHealth.$inferInsert;

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 30 }).notNull().unique(),
  email: varchar('email', { length: 256 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 256 }).notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  verificationToken: varchar('verification_token', { length: 256 }),
  verificationTokenExpiresAt: timestamp('verification_token_expires_at'),
  resetPasswordToken: varchar('reset_password_token', { length: 256 }),
  resetPasswordTokenExpiresAt: timestamp('reset_password_token_expires_at'),
  displayName: varchar('display_name', { length: 100 }),
  bio: text('bio'),
  avatarUrl: varchar('avatar_url', { length: 512 }),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// --- Phase 6: Problems Engine Schemas ---

export const difficultyEnum = pgEnum('difficulty', ['Easy', 'Medium', 'Hard']);
export const submissionStatusEnum = pgEnum('submission_status', [
  'Pending',
  'Accepted',
  'Wrong Answer',
  'Runtime Error',
  'Compilation Error',
  'Time Limit Exceeded',
  'Memory Limit Exceeded'
]);

export const problems = pgTable('problems', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 256 }).notNull(),
  slug: varchar('slug', { length: 256 }).notNull().unique(),
  description: text('description').notNull(),
  difficulty: difficultyEnum('difficulty').notNull(),
  constraints: jsonb('constraints').default('[]').notNull().$type<string[]>(),
  examples: jsonb('examples').default('[]').notNull().$type<Array<{ input: string; output: string; explanation?: string }>>(),
  starterCode: jsonb('starter_code').default('{}').notNull().$type<Record<string, string>>(),
  solutionTemplate: text('solution_template'),
  acceptanceRate: real('acceptance_rate').default(0).notNull(),
  totalSubmissions: integer('total_submissions').default(0).notNull(),
  successfulSubmissions: integer('successful_submissions').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Problem = typeof problems.$inferSelect;
export type NewProblem = typeof problems.$inferInsert;

export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

export const problemTags = pgTable('problem_tags', {
  problemId: integer('problem_id').notNull().references(() => problems.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.problemId, table.tagId] }),
}));

export const testCases = pgTable('test_cases', {
  id: serial('id').primaryKey(),
  problemId: integer('problem_id').notNull().references(() => problems.id, { onDelete: 'cascade' }),
  input: text('input').notNull(),
  expectedOutput: text('expected_output').notNull(),
  isHidden: boolean('is_hidden').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type TestCase = typeof testCases.$inferSelect;
export type NewTestCase = typeof testCases.$inferInsert;

export const submissions = pgTable('submissions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  problemId: integer('problem_id').notNull().references(() => problems.id, { onDelete: 'cascade' }),
  language: varchar('language', { length: 50 }).notNull(),
  sourceCode: text('source_code').notNull(),
  status: submissionStatusEnum('status').notNull(),
  runtime: integer('runtime'), // in ms
  memory: integer('memory'), // in KB
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
});

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;

// --- Phase 7: Online Judge Engine Schemas ---

export const submissionResults = pgTable('submission_results', {
  id: serial('id').primaryKey(),
  submissionId: integer('submission_id').notNull().references(() => submissions.id, { onDelete: 'cascade' }),
  testCaseId: integer('test_case_id').notNull().references(() => testCases.id, { onDelete: 'cascade' }),
  status: submissionStatusEnum('status').notNull(),
  runtime: integer('runtime'),
  memory: integer('memory'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type SubmissionResult = typeof submissionResults.$inferSelect;
export type NewSubmissionResult = typeof submissionResults.$inferInsert;

export const executionJobs = pgTable('execution_jobs', {
  id: serial('id').primaryKey(),
  submissionId: integer('submission_id').notNull().references(() => submissions.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 50 }).default('queued').notNull(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type ExecutionJob = typeof executionJobs.$inferSelect;
export type NewExecutionJob = typeof executionJobs.$inferInsert;

export const solvedProblems = pgTable('solved_problems', {
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  problemId: integer('problem_id').notNull().references(() => problems.id, { onDelete: 'cascade' }),
  firstSolvedAt: timestamp('first_solved_at').defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.problemId] }),
}));

export type SolvedProblem = typeof solvedProblems.$inferSelect;
export type NewSolvedProblem = typeof solvedProblems.$inferInsert;
