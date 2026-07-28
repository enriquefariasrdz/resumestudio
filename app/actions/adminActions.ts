'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function getAllUsersAndResumes() {
  try {
    const session = await getCurrentUser()
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized: Only administrators can access this data.' }
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        resumes: {
          select: {
            id: true,
            title: true,
            versionName: true,
            content: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { success: true, users }
  } catch (error) {
    console.error('Failed to fetch admin users and resumes:', error)
    return { success: false, error: 'Failed to fetch admin users data.' }
  }
}

export async function updateUserRole(targetUserId: string, newRole: 'USER' | 'ADMIN') {
  try {
    const session = await getCurrentUser()
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized: Only administrators can update roles.' }
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to update user role:', error)
    return { success: false, error: 'Failed to update user role.' }
  }
}
