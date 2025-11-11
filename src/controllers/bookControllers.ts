import { Request, Response } from "express";
import { PrismaClient, Status } from "@prisma/client";
import PDFDocument, { moveDown } from "pdfkit"
import fs from "fs";
import path from "path";
import { BASE_URL } from "../global";


const prisma = new PrismaClient({ errorFormat: "pretty" });

export const getAllBook = async (request: Request, response: Response) => {
  try {
    const { search, userId } = request.query;

    const parsedUserId = userId ? Number(userId) : null;
    const filters = parsedUserId
      ? { userId: parsedUserId }
      : search
      ? {
          OR: [
            { kos: { name: { contains: search.toString(), mode: "insensitive" } } },
            { user: { name: { contains: search.toString(), mode: "insensitive" } } },
          ],
        }
      : {};

    const allBook = await prisma.book.findMany({
      where: filters,
      include: {
        kos: { select: { id: true, name: true, address: true } },
        user: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { startDate: "desc" },
    });

    return response.status(200).json({
      status: true,
      data: allBook,
      message: "Daftar booking berhasil diambil",
    });
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `Terjadi kesalahan: ${error}`,
    });
  }
};

export const createBook = async (request: Request, response: Response) => {
  try {
    const user = (request as any).user;

    if (!user) {
      return response.status(401).json({
        status: false,
        message: "User tidak ditemukan dalam token",
      });
    }

    if (user.role !== "SOCIETY") {
      return response.status(403).json({
        status: false,
        message: "Hanya society yang dapat melakukan booking kos.",
      });
    }

    const { startDate, endDate, kosId } = request.body;

    const kos = await prisma.kos.findUnique({ where: { id: Number(kosId) } });
    if (!kos) {
      return response.status(404).json({
        status: false,
        message: `Kos dengan id ${kosId} tidak ditemukan.`,
      });
    }

    // Cegah double booking pending
    const existingBook = await prisma.book.findFirst({
      where: {
        user_id: user.id,
        kos_id: Number(kosId),
        status: "PENDING",
      },
    });
    if (existingBook) {
      return response.status(400).json({
        status: false,
        message: "Kamu sudah memiliki booking pending untuk kos ini.",
      });
    }

    const newBook = await prisma.book.create({
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        kos_id: Number(kosId),
        user_id: user.id,
        status: Status.PENDING,
      },
    });

    return response.status(201).json({
      status: true,
      message: `Booking berhasil dibuat oleh ${user.name} untuk kos ${kos.name}`,
      data: newBook,
    });
  } catch (error: any) {
    return response.status(400).json({
      status: false,
      message: `Error membuat booking: ${error.message}`,
    });
  }
};

export const updateBook = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;
    const { startDate, endDate, status } = request.body;
    const user = (request as any).user;

    const findBook = await prisma.book.findUnique({
      where: { id: Number(id) },
      include: { kos: true },
    });

    // 📌 Validasi booking ada atau tidak
    if (!findBook) {
      return response.status(404).json({
        status: false,
        message: "Booking tidak ditemukan.",
      });
    }

    if (user.role === "SOCIETY") {
      // Pastikan booking milik user itu sendiri
      if (findBook.user_id !== user.id) {
        return response.status(403).json({
          status: false,
          message: "Kamu tidak boleh mengedit booking milik orang lain.",
        });
      }

      // Society hanya bisa edit ketika masih pending
      if (findBook.status !== "PENDING") {
        return response.status(400).json({
          status: false,
          message: "Booking tidak dapat diubah karena sudah diproses oleh owner.",
        });
      }

      // Tidak boleh ubah status
      if (status && status !== findBook.status) {
        return response.status(403).json({
          status: false,
          message: "Kamu tidak diizinkan mengubah status booking.",
        });
      }

      // Update tanggal saja
      const updatedBook = await prisma.book.update({
        where: { id: Number(id) },
        data: {
          startDate: startDate ? new Date(startDate) : findBook.startDate,
          endDate: endDate ? new Date(endDate) : findBook.endDate,
        },
      });

      return response.status(200).json({
        status: true,
        role: user.role,
        message: "Tanggal booking berhasil diperbarui.",
        data: updatedBook,
      });
    }

    if (user.role === "OWNER") {
      // Pastikan owner adalah pemilik kos yang dipesan
      if (findBook.kos.user_id !== user.id) {
        return response.status(403).json({
          status: false,
          message: "Kamu bukan pemilik kos dari booking ini.",
        });
      }

      // Owner hanya boleh ubah status (accept/reject)
      if (!status) {
        return response.status(400).json({
          status: false,
          message: "Parameter 'status' wajib diisi (accept/reject).",
        });
      }

      // Pastikan status valid
      const validStatus = ["PENDING", "ACCEPT", "REJECT"];
      if (!validStatus.includes(status)) {
        return response.status(400).json({
          status: false,
          message: "Status tidak valid. Gunakan: 'PENDING', 'ACCEPT', atau 'REJECT'.",
        });
      }

      const updatedBook = await prisma.book.update({
        where: { id: Number(id) },
        data: { status },
      });

      return response.status(200).json({
        status: true,
        role: user.role,
        message: `Status booking berhasil diubah menjadi '${status}'.`,
        data: updatedBook,
      });
    }

    return response.status(403).json({
      status: false,
      message: "Role kamu tidak diizinkan mengedit booking.",
    });

  } catch (error: any) {
    console.error("❌ Error updateBook:", error);
    return response.status(500).json({
      status: false,
      message: `Terjadi kesalahan saat mengubah booking: ${error.message}`,
    });
  }
};

export const deleteBook = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;
    const user = (request as any).user;

    const findBook = await prisma.book.findUnique({ where: { id: Number(id) } });
    if (!findBook) {
      return response.status(404).json({
        status: false,
        message: "Booking tidak ditemukan",
      });
    }

    if (findBook.user_id !== user.id || user.role !== "SOCIETY") {
      return response.status(403).json({
        status: false,
        message: "Kamu tidak memiliki izin menghapus booking ini",
      });
    }

    if (findBook.status !== "PENDING") {
      return response.status(400).json({
        status: false,
        message: "Booking tidak bisa dihapus karena sudah diproses oleh owner",
      });
    }

    await prisma.book.delete({ where: { id: Number(id) } });

    return response.status(200).json({
      status: true,
      message: "Booking berhasil dihapus",
    });
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `Error menghapus booking: ${error}`,
    });
  }
};

export const getBookHistory = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { month, year } = req.query;

    if (!user || user.role !== "OWNER") {
      return res.status(403).json({
        status: false,
        message: "Hanya owner yang dapat melihat histori booking",
      });
    }

    if (!month || !year) {
      return res.status(400).json({
        status: false,
        message:
          "Parameter 'month' dan 'year' wajib disertakan. Contoh: /book/history?month=10&year=2025",
      });
    }

    const ownerKos = await prisma.kos.findMany({
      where: { user_id: user.id },
      select: { id: true },
    });

    if (ownerKos.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Anda belum memiliki kos.",
      });
    }

    const kosIds = ownerKos.map((k) => k.id);
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

    const bookings = await prisma.book.findMany({
      where: {
        kos_id: { in: kosIds },
        startDate: { gte: startDate, lte: endDate },
      },
      include: {
        kos: { select: { id: true, name: true, address: true } },
        user: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { startDate: "desc" },
    });

    if (bookings.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Tidak ada transaksi untuk bulan tersebut",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Histori booking berhasil diambil",
      total: bookings.length,
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `Terjadi kesalahan server: ${error}`,
    });
  }
};

export const printBookingReceipt = async (request: Request, response: Response) => {
  try {
    const { id } = request.params

    const booking = await prisma.book.findUnique({
      where: { id: Number(id) },
      include: {
        kos: true,
        user: true,
      },
    })

    if (!booking) {
      return response.status(404).json({
        status: false,
        message: "Booking not found",
      })
    }

    // Calculate total price
    const start = new Date(booking.startDate)
    const end = new Date(booking.endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate() // gets actual days in the month
    const dailyRate = booking.kos.price_per_month / daysInMonth
    const total_price = Math.ceil(dailyRate * days)

    // Create PDF
    const doc = new PDFDocument()
    const filename = `receipt_${booking.id}_${Date.now()}.pdf`
    const filepath = path.join(BASE_URL, "..", "public", "receipts", filename)

    // Ensure directory exists
    const dir = path.dirname(filepath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    const stream = fs.createWriteStream(filepath)
    doc.pipe(stream)

    // Add content
    doc.fontSize(20).text("BOOKING RECEIPT", { align: "center" })
    doc.text(`========================================`)
    doc.moveDown()
    
    doc.fontSize(12).text(`Booking ID: ${booking.id}`, { align: "left" })
    doc.text(`Date: ${new Date().toLocaleDateString()}`)
    doc.moveDown()

    doc.text("GUEST INFORMATION", { underline: true })
    doc.text(`Name: ${booking.user.name}`)
    doc.text(`Email: ${booking.user.email}`)
    doc.text(`Phone: ${booking.user.phone}`)
    doc.moveDown()

    doc.text("KOS INFORMATION", { underline: true })
    doc.text(`Kos Name: ${booking.kos.name}`)
    doc.text(`Address: ${booking.kos.address}`)
    doc.text(`Gender: ${booking.kos.gender}`)
    doc.moveDown()

    doc.text("BOOKING DETAILS", { underline: true })
    doc.text(`Check-in: ${booking.startDate.toLocaleDateString()}`)
    doc.text(`Check-out: ${booking.endDate.toLocaleDateString()}`)
    doc.text(`Duration: ${days} days`)
    doc.text(`Price per Month: Rp ${booking.kos.price_per_month.toLocaleString("id-ID")}`)
    doc.font("Helvetica-Bold").text(`Total Price: Rp ${total_price.toLocaleString("id-ID")}`)
    doc.font("Helvetica")
    doc.moveDown()

    doc.text(`Status: ${booking.status} `)
    doc.moveDown()

    doc.fontSize(10).text("TERIMAKASIII SUDAH BOOKING DI SINI!", { align: "center" })

    doc.end()

    stream.on("finish", () => {
      response.download(filepath, filename, (err) => {
        if (err) {
          console.error("Error downloading file:", err)
        }
        // Optionally delete file after download
        fs.unlink(filepath, (err) => {
          if (err) console.error("Error deleting file:", err)
        })
      })
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `Error: ${error}`,
    })
  }
}