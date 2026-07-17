export interface LeadRepository { create(input: Record<string, unknown>): Promise<string> }

export function createD1LeadRepository(db: D1Database): LeadRepository {
  return { async create(input) {
    const id = crypto.randomUUID();
    await db.prepare("INSERT INTO leads (id, name, email, message, consent_at) VALUES (?, ?, ?, ?, datetime('now'))")
      .bind(id, input.name, input.email, input.message).run();
    return id;
  }};
}
