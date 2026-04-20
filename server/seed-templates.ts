import { eq } from "drizzle-orm";
import { db } from "./storage";
import { pdfTemplates } from "@shared/schema";

const SIE_DEFAULT_NAME = "SIE Padrão";

export async function seedDefaultTemplates() {
  try {
    const existing = await db
      .select()
      .from(pdfTemplates)
      .where(eq(pdfTemplates.builtInRenderer, "sie-default"))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(pdfTemplates).values({
        name: SIE_DEFAULT_NAME,
        description:
          "Template oficial SIE (não editável). Reproduz a ficha técnica padrão de duas páginas com cabeçalho vermelho e logos de certificação.",
        content: null,
        pageSize: "A4",
        orientation: "portrait",
        builtInRenderer: "sie-default",
        isGlobalDefault: true,
        isActive: true,
      });
      console.log("[seed] Created built-in PDF template: SIE Padrão");
    } else {
      // Ensure it stays the global default if no other default exists
      const anyOtherDefault = await db
        .select()
        .from(pdfTemplates)
        .where(eq(pdfTemplates.isGlobalDefault, true))
        .limit(1);
      if (anyOtherDefault.length === 0) {
        await db
          .update(pdfTemplates)
          .set({ isGlobalDefault: true })
          .where(eq(pdfTemplates.id, existing[0].id));
      }
    }
  } catch (error) {
    console.error("[seed] Error seeding PDF templates:", error);
  }
}
