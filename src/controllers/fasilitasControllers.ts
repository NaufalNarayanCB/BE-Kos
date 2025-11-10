import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createFacility = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { kos_id, facility } = req.body;

  try {
    // Validasi input
    if (!kos_id || !facility) {
      return res.status(400).json({ message: 'kos_id dan facility wajib dikirim' });
    }

    // Cek apakah kos ada
    const kos = await prisma.kos.findUnique({ where: { id: kos_id } });
    if (!kos) {
      return res.status(404).json({ message: 'Kos tidak ditemukan' });
    }

    // Pastikan user adalah pemilik kos
    if (kos.user_id !== userId) {
      return res.status(403).json({ message: 'Bukan pemilik kos ini' });
    }

    // Tambahkan fasilitas baru
    const newFacility = await prisma.kos_facilities.create({
      data: { kos_id, facility },
    });

    res.status(201).json({
      status: true,
      message: 'Fasilitas berhasil ditambahkan',
      facility: newFacility,
    });
  } catch (error) {
    const errorMessage = (error as Error).message || String(error);
    console.error("Error create fasilitas:", error);
    res.status(500).json({
      status: false,
      message: `Gagal menambahkan fasilitas. ${errorMessage}`,
    });
  }
};

export const getAllFacility = async (req: Request, res: Response) => {
  try {
      const facilities = await prisma.kos_facilities.findMany({
          select: {
              id: true,
              facility: true,
              kos: {
                  select: {
                      name: true
                  }
              }
          }
      })

      return res.json({
          status: true,
          data: facilities,
          message: `Berhasil mengambil semua fasilitas`
      }).status(200)

  } catch (error) {
      return res.json({
          status: false,
          message: `Gagal ambil fasilitas. ${error}`
      }).status(400)
  }
}

export const getFacilitiesByKos = async (req: Request, res: Response) => {
  const kos_id = parseInt(req.params.id)

  try {
    const facilities = await prisma.kos_facilities.findMany({
      where: { kos_id }
    })

    res.status(200).json({ facilities })
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil fasilitas', error })
  }
}

export const getFacilityByKosId = async (req: Request, res: Response) => {
  try {
    const { kosId } = req.params;

    if (!kosId) {
      return res.status(400).json({
        status: false,
        message: "Parameter kosId wajib diisi"
      });
    }

    const facilities = await prisma.kos_facilities.findMany({
      where: { kos_id: Number(kosId) }
    });

    if (facilities.length === 0) {
      return res.status(404).json({
        status: false,
        message: `Belum ada fasilitas untuk kos dengan id ${kosId}`
      });
    }

    return res.status(200).json({
      status: true,
      data: facilities,
      message: `Berhasil menampilkan fasilitas untuk kos id ${kosId}`
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      message: `Terjadi kesalahan: ${error}`
    });
  }
};


export const deleteFacility = async (req: Request, res: Response) => {
  const facilityId = parseInt(req.params.id)
  const userId = (req as any).user.id

  try {
    const facility = await prisma.kos_facilities.findUnique({
      where: { id: facilityId },
      include: { kos: true }
    })

    if (!facility) return res.status(404).json({ message: 'Fasilitas tidak ditemukan' })
    if (facility.kos.user_id !== userId)
      return res.status(403).json({ message: 'Bukan pemilik kos ini' })

    await prisma.kos_facilities.delete({ where: { id: facilityId } })
    res.json({ message: 'Fasilitas berhasil dihapus' })
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus fasilitas', error })
  }
}

export const updateFacility = async (req: Request, res: Response) => {
  const facilityId = parseInt(req.params.id);
  const userId = (req as any).user.id;
  const { facility } = req.body;

  try {
    const existingFacility = await prisma.kos_facilities.findUnique({
      where: { id: facilityId },
      include: { kos: true }
    });

    if (!existingFacility) {
      return res.status(404).json({ message: 'Fasilitas tidak ditemukan' });
    }

    if (existingFacility.kos_id !== userId) {
      return res.status(403).json({ message: 'Bukan pemilik kos ini' });
    }

    const updatedFacility = await prisma.kos_facilities.update({
      where: { id: facilityId },
      data: { facility }
    });

    res.json({ message: 'Fasilitas berhasil diperbarui', facility: updatedFacility });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui fasilitas', error });
  }
};
