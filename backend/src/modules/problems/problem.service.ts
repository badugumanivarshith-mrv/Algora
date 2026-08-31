import { db } from '../../db';
import { problems, tags, problemTags, testCases, Problem } from '../../db/schema';
import { eq, and, ilike } from 'drizzle-orm';
import { CreateProblemInput, CreateTestCaseInput } from './problem.types';

export class ProblemService {
  async getProblems(filters: { search?: string; difficulty?: 'Easy' | 'Medium' | 'Hard'; tag?: string }) {
    let problemList: Problem[] = [];

    // If tag filter is provided, get problem IDs associated with that tag slug first
    if (filters.tag) {
      const matchingTags = await db
        .select({ problemId: problemTags.problemId })
        .from(problemTags)
        .innerJoin(tags, eq(tags.id, problemTags.tagId))
        .where(eq(tags.slug, filters.tag));

      const problemIds = matchingTags.map(t => t.problemId);
      if (problemIds.length === 0) {
        return [];
      }

      // Query problems matching the ids and search/difficulty
      const baseQuery = db.select().from(problems);

      // Filter by the allowed problemIds
      const filteredProblems = await baseQuery;
      problemList = filteredProblems.filter(p => problemIds.includes(p.id));
      if (filters.search) {
        problemList = problemList.filter(p => p.title.toLowerCase().includes(filters.search!.toLowerCase()));
      }
      if (filters.difficulty) {
        problemList = problemList.filter(p => p.difficulty === filters.difficulty);
      }
    } else {
      // General problems query
      const baseQuery = db.select().from(problems);
      const conditions = [];
      
      if (filters.search) {
        conditions.push(ilike(problems.title, `%${filters.search}%`));
      }
      if (filters.difficulty) {
        conditions.push(eq(problems.difficulty, filters.difficulty));
      }

      if (conditions.length > 0) {
        problemList = await baseQuery.where(and(...conditions));
      } else {
        problemList = await baseQuery;
      }
    }

    if (problemList.length === 0) {
      return [];
    }

    // Fetch all tags associated with these problems
    const allProblemTags = await db
      .select({
        problemId: problemTags.problemId,
        tag: tags,
      })
      .from(problemTags)
      .innerJoin(tags, eq(tags.id, problemTags.tagId));

    // Map tags back to problems
    return problemList.map((p) => {
      const pTags = allProblemTags
        .filter((pt) => pt.problemId === p.id)
        .map((pt) => pt.tag);
      return {
        ...p,
        tags: pTags,
      };
    });
  }

  async getProblemBySlug(slug: string) {
    const [problem] = await db.select().from(problems).where(eq(problems.slug, slug)).limit(1);
    if (!problem) return undefined;

    // Get tags
    const pTags = await db
      .select({ tag: tags })
      .from(problemTags)
      .innerJoin(tags, eq(tags.id, problemTags.tagId))
      .where(eq(problemTags.problemId, problem.id));

    return {
      ...problem,
      tags: pTags.map((t) => t.tag),
    };
  }

  async getProblemById(id: number) {
    const [problem] = await db.select().from(problems).where(eq(problems.id, id)).limit(1);
    return problem;
  }

  async createProblem(data: CreateProblemInput) {
    const [problem] = await db
      .insert(problems)
      .values({
        title: data.title,
        slug: data.slug,
        description: data.description,
        difficulty: data.difficulty,
        constraints: data.constraints,
        examples: data.examples,
        starterCode: data.starterCode,
        solutionTemplate: data.solutionTemplate || null,
      })
      .returning();

    if (data.tagIds && data.tagIds.length > 0) {
      await db.insert(problemTags).values(
        data.tagIds.map((tagId) => ({
          problemId: problem.id,
          tagId,
        }))
      );
    }

    return this.getProblemBySlug(problem.slug);
  }

  async updateProblem(id: number, data: Partial<CreateProblemInput>) {
    const [updated] = await db
      .update(problems)
      .set({
        title: data.title,
        slug: data.slug,
        description: data.description,
        difficulty: data.difficulty,
        constraints: data.constraints,
        examples: data.examples,
        starterCode: data.starterCode,
        solutionTemplate: data.solutionTemplate,
        updatedAt: new Date(),
      })
      .where(eq(problems.id, id))
      .returning();

    if (!updated) return undefined;

    if (data.tagIds !== undefined) {
      // Clear old tag mappings
      await db.delete(problemTags).where(eq(problemTags.problemId, id));

      if (data.tagIds.length > 0) {
        await db.insert(problemTags).values(
          data.tagIds.map((tagId) => ({
            problemId: id,
            tagId,
          }))
        );
      }
    }

    return this.getProblemBySlug(updated.slug);
  }

  async deleteProblem(id: number) {
    const [deleted] = await db.delete(problems).where(eq(problems.id, id)).returning();
    return !!deleted;
  }

  async getTags() {
    return db.select().from(tags);
  }

  async createTag(name: string, slug: string) {
    const [tag] = await db.insert(tags).values({ name, slug }).returning();
    return tag;
  }

  async getTestCases(problemId: number, includeHidden = false) {
    const conditions = [eq(testCases.problemId, problemId)];
    if (!includeHidden) {
      conditions.push(eq(testCases.isHidden, false));
    }
    return db.select().from(testCases).where(and(...conditions));
  }

  async createTestCase(data: CreateTestCaseInput) {
    const [tc] = await db
      .insert(testCases)
      .values({
        problemId: data.problemId,
        input: data.input,
        expectedOutput: data.expectedOutput,
        isHidden: data.isHidden ?? false,
      })
      .returning();
    return tc;
  }
}

export const problemService = new ProblemService();
