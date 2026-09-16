import { NextResponse } from "next/server";
import { Prisma, ResourceType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminModule } from "@/lib/rbac";

function failure(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHORIZED")
    return NextResponse.json(
      { ok: false, message: "Non autorisé." },
      { status: 401 },
    );
  if (error instanceof Error && error.message === "FORBIDDEN")
    return NextResponse.json(
      { ok: false, message: "Accès refusé." },
      { status: 403 },
    );
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  )
    return NextResponse.json(
      { ok: false, message: "Ressource introuvable." },
      { status: 404 },
    );
  if (error instanceof SyntaxError)
    return NextResponse.json(
      { ok: false, message: "Données invalides." },
      { status: 400 },
    );
  console.error("Resource update error:", error);
  return NextResponse.json(
    { ok: false, message: "Impossible de modifier la ressource." },
    { status: 500 },
  );
}
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminModule("resources");
    const { id } = await params;
    const payload = await request.json();
    const text = (key: string) =>
      typeof payload?.[key] === "string" ? payload[key].trim() : "";
    const name = text("name"),
      contact = text("contact"),
      countryId = text("countryId"),
      type = text("type");
    const website = text("website");
    let validWebsite = true;
    if (website) {
      try {
        validWebsite = ["http:", "https:"].includes(new URL(website).protocol);
      } catch {
        validWebsite = false;
      }
    }
    if (
      !name ||
      !contact ||
      !countryId ||
      !Object.values(ResourceType).includes(type as ResourceType) ||
      !validWebsite
    )
      return NextResponse.json(
        {
          ok: false,
          message:
            "Vérifiez le nom, le contact, le pays, le type et l’adresse du site web.",
        },
        { status: 400 },
      );
    if (
      !(await prisma.country.findUnique({
        where: { id: countryId },
        select: { id: true },
      }))
    )
      return NextResponse.json(
        { ok: false, message: "Pays introuvable." },
        { status: 400 },
      );
    await prisma.resource.update({
      where: { id },
      data: {
        name,
        contact,
        countryId,
        type: type as ResourceType,
        description: text("description") || null,
        address: text("address") || null,
        website: website || null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminModule("resources");
    const { id } = await params;
    await prisma.resource.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
