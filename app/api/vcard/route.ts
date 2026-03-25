import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    let vcf: string | null = null;
    let fileName: string | null = null;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      // Hidden form submission (iOS/Android compatible)
      const formData = await req.formData();
      vcf = formData.get("vcf") as string;
      fileName = formData.get("fileName") as string;
    } else {
      // JSON fetch fallback
      const json = await req.json();
      vcf = json.vcf;
      fileName = json.fileName;
    }

    if (!vcf || typeof vcf !== "string") {
      return NextResponse.json({ error: "Missing vCard data" }, { status: 400 });
    }

    const safeName = (fileName || "contact").replace(/[^a-zA-Z0-9_-]/g, "_");

    return new NextResponse(vcf, {
      status: 200,
      headers: {
        "Content-Type": "text/x-vcard; charset=utf-8",
        "Content-Disposition": `inline; filename="${safeName}.vcf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
