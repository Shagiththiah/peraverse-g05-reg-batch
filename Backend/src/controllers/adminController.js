// Backend/src/controllers/adminController.js
import prisma from "../services/prisma.js";

/**
 * Fetch all registered visitors (for Admin dashboard)
 */
export const getVisitors = async (req, res) => {
  try {
    const visitors = await prisma.visitor.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(visitors);
  } catch (error) {
    console.error("Error fetching visitors:", error);
    res.status(500).json({ error: "Failed to fetch visitors" });
  }
};

/**
 * Get dashboard statistics including RFID tags
 */
export const getDashboardStats = async (req, res) => {
  try {
    // Get registration statistics
    const totalRegistrations = await prisma.registration.count();
    
    const registrationsByType = await prisma.registration.groupBy({
      by: ['type'],
      _count: {
        type: true
      }
    });

    const totalPeople = await prisma.registration.aggregate({
      _sum: {
        group_size: true
      }
    });

    // Get RFID tag statistics
    const totalRfidTags = await prisma.rfidTag.count();
    
    const availableRfidTags = await prisma.rfidTag.count({
      where: { status: 'AVAILABLE' }
    });

    const assignedRfidTags = await prisma.rfidTag.count({
      where: { status: 'ASSIGNED' }
    });

    const deactivatedRfidTags = await prisma.rfidTag.count({
      where: { status: 'DEACTIVATED' }
    });

    // Get recent registrations with RFID tags
    const recentRegistrations = await prisma.registration.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        rfidTag: true
      }
    });

    const stats = {
      totalRegistrations,
      totalPeople: totalPeople._sum.group_size || 0,
      registrationsByType: registrationsByType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {}),
      rfidTags: {
        total: totalRfidTags,
        available: availableRfidTags,
        assigned: assignedRfidTags,
        deactivated: deactivatedRfidTags
      },
      recentRegistrations
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
};

/**
 * Assign RFID tag to registration
 */
export const assignRfidTag = async (req, res) => {
  try {
    const { registrationId, tagNumber } = req.body;

    // Find available RFID tag
    const rfidTag = await prisma.rfidTag.findFirst({
      where: {
        tagNumber: tagNumber,
        status: 'AVAILABLE'
      }
    });

    if (!rfidTag) {
      return res.status(400).json({ error: "RFID tag not available" });
    }

    // Check if registration exists
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId }
    });

    if (!registration) {
      return res.status(400).json({ error: "Registration not found" });
    }

    // Assign RFID tag
    const updatedTag = await prisma.rfidTag.update({
      where: { id: rfidTag.id },
      data: {
        status: 'ASSIGNED',
        assignedTo: registrationId,
        assignedAt: new Date()
      }
    });

    // Update registration with RFID tag
    await prisma.registration.update({
      where: { id: registrationId },
      data: { rfidTagId: rfidTag.id }
    });

    res.json({ message: "RFID tag assigned successfully", rfidTag: updatedTag });
  } catch (error) {
    console.error("Error assigning RFID tag:", error);
    res.status(500).json({ error: "Failed to assign RFID tag" });
  }
};

/**
 * Deactivate RFID tag
 */
export const deactivateRfidTag = async (req, res) => {
  try {
    const { tagId } = req.params;

    const rfidTag = await prisma.rfidTag.findUnique({
      where: { id: parseInt(tagId) }
    });

    if (!rfidTag) {
      return res.status(400).json({ error: "RFID tag not found" });
    }

    // Deactivate RFID tag
    const updatedTag = await prisma.rfidTag.update({
      where: { id: parseInt(tagId) },
      data: {
        status: 'DEACTIVATED',
        deactivatedAt: new Date(),
        assignedTo: null
      }
    });

    // Remove RFID tag from registration
    if (rfidTag.assignedTo) {
      await prisma.registration.update({
        where: { id: rfidTag.assignedTo },
        data: { rfidTagId: null }
      });
    }

    res.json({ message: "RFID tag deactivated successfully", rfidTag: updatedTag });
  } catch (error) {
    console.error("Error deactivating RFID tag:", error);
    res.status(500).json({ error: "Failed to deactivate RFID tag" });
  }
};

/**
 * Get available RFID tags
 */
export const getAvailableRfidTags = async (req, res) => {
  try {
    const availableTags = await prisma.rfidTag.findMany({
      where: { status: 'AVAILABLE' },
      orderBy: { tagNumber: 'asc' }
    });

    res.json(availableTags);
  } catch (error) {
    console.error("Error fetching available RFID tags:", error);
    res.status(500).json({ error: "Failed to fetch available RFID tags" });
  }
};