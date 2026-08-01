import { Injectable, NotFoundException } from "@nestjs/common";
import { Doc } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AiService } from "../ai/ai.service";
import { CreateDocDto } from "./dto/create-doc.dto";

const MAX_RETRIEVED_DOCS = 3;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2);
}

/**
 * Lexical (keyword-overlap) retrieval — an MVP stand-in for the vector-store
 * retrieval described in docs/ARCHITECTURE.md's "AI & RAG Pipeline". Good
 * enough for a handful of runbooks; swap for embeddings + a vector index
 * once the doc set outgrows keyword matching.
 */
function retrieveRelevantDocs(question: string, docs: Doc[], limit: number): Doc[] {
  const questionTerms = new Set(tokenize(question));
  if (questionTerms.size === 0) return [];

  const scored = docs.map((doc) => {
    const docTerms = tokenize(`${doc.title} ${doc.content}`);
    const score = docTerms.reduce((count, term) => count + (questionTerms.has(term) ? 1 : 0), 0);
    return { doc, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.doc);
}

@Injectable()
export class DocsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  create(dto: CreateDocDto) {
    return this.prisma.doc.create({ data: dto });
  }

  findAll() {
    return this.prisma.doc.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findOne(id: string) {
    const doc = await this.prisma.doc.findUnique({ where: { id } });
    if (!doc) {
      throw new NotFoundException(`Doc ${id} not found`);
    }
    return doc;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.doc.delete({ where: { id } });
  }

  async chat(question: string) {
    const docs = await this.prisma.doc.findMany();
    const relevant = retrieveRelevantDocs(question, docs, MAX_RETRIEVED_DOCS);
    const answer = await this.aiService.chatWithDocs(
      question,
      relevant.map((d) => ({ title: d.title, content: d.content })),
    );
    return { answer, sources: relevant.map((d) => ({ id: d.id, title: d.title })) };
  }
}
