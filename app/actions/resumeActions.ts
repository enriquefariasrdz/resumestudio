'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// Fetch all resume versions for current user (or specified user if admin)
export async function getResumes(targetUserId?: string) {
  try {
    const session = await getCurrentUser()
    if (!session) {
      return { success: false, error: 'Unauthorized: Please log in to view resumes.' }
    }

    let userId = session.userId
    // Only admin can view other users' resumes
    if (targetUserId && session.role === 'ADMIN') {
      userId = targetUserId
    }

    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    })
    return { success: true, data: resumes }
  } catch (error) {
    console.error('Failed to fetch resumes:', error)
    return { success: false, error: 'Failed to fetch resumes' }
  }
}

// Save or update a specific resume version for current user
export async function saveResumeVersion(
  resumeId: string | null,
  title: string,
  versionName: string,
  contentStr: string
) {
  try {
    const session = await getCurrentUser()
    if (!session) {
      return { success: false, error: 'Unauthorized: Please log in to save resumes.' }
    }

    const userId = session.userId
    let savedResume

    if (resumeId) {
      // Check ownership
      const existing = await prisma.resume.findUnique({ where: { id: resumeId } })
      if (!existing) {
        return { success: false, error: 'Resume version not found.' }
      }
      if (existing.userId !== userId && session.role !== 'ADMIN') {
        return { success: false, error: 'Unauthorized: You do not own this resume.' }
      }

      savedResume = await prisma.resume.update({
        where: { id: resumeId },
        data: { title, versionName, content: contentStr, updatedAt: new Date() },
      })
    } else {
      // Create brand new version
      savedResume = await prisma.resume.create({
        data: {
          userId,
          title: title || 'Untitled Resume',
          versionName: versionName || 'v1',
          content: contentStr,
        },
      })
    }

    revalidatePath('/')
    return { success: true, data: savedResume }
  } catch (error) {
    console.error('Failed to save resume:', error)
    return { success: false, error: 'Failed to save resume' }
  }
}

// Delete a resume version
export async function deleteResumeVersion(resumeId: string) {
  try {
    const session = await getCurrentUser()
    if (!session) {
      return { success: false, error: 'Unauthorized: Please log in.' }
    }

    const existing = await prisma.resume.findUnique({ where: { id: resumeId } })
    if (!existing) {
      return { success: false, error: 'Resume version not found.' }
    }

    if (existing.userId !== session.userId && session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized to delete this resume.' }
    }

    await prisma.resume.delete({
      where: { id: resumeId },
    })

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete resume:', error)
    return { success: false, error: 'Failed to delete resume' }
  }
}