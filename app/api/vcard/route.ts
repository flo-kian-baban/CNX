import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { vcf, fileName } = await req.json();

    if (!vcf || typeof vcf !== "string") {
      return NextResponse.json({ error: "Missing vCard data" }, { status: 400 });
    }

    const safeName = (fileName || "contact").replace(/[^a-zA-Z0-9_-]/g, "_");

    return new NextResponse(vcf, {
      status: 200,
      headers: {
        "Content-Type": "text/vcard; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeName}.vcf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
