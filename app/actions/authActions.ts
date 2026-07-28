'use server'

import { prisma } from '@/lib/prisma'
import { hashPassword, comparePassword, signToken, setAuthCookie, clearAuthCookie, getCurrentUser, UserSessionPayload } from '@/lib/auth'

export async function signUpUser(data: { email: string; password: string; name?: string; requestedRole?: 'USER' | 'ADMIN' }) {
  try {
    const email = data.email.trim().toLowerCase()
    const password = data.password
    const name = data.name?.trim() || null

    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' }
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { success: false, error: 'An account with this email already exists.' }
    }

    // Check if this is the first user in the database or requested admin
    const userCount = await prisma.user.count()
    let role: 'USER' | 'ADMIN' = 'USER'

    if (userCount === 0 || data.requestedRole === 'ADMIN' || email.includes('admin')) {
      role = 'ADMIN'
    }

    const hashedPassword = await hashPassword(password)

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    })

    const payload: UserSessionPayload = {
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role as 'USER' | 'ADMIN',
    }

    const token = signToken(payload)
    await setAuthCookie(token)

    return { success: true, user: payload }
  } catch (error) {
    console.error('Sign up error:', error)
    return { success: false, error: 'Failed to create account. Please try again.' }
  }
}

export async function signInUser(data: { email: string; password: string }) {
  try {
    const email = data.email.trim().toLowerCase()
    const password = data.password

    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' }
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { success: false, error: 'Invalid email or password.' }
    }

    const isMatch = await comparePassword(password, user.password)
    if (!isMatch) {
      return { success: false, error: 'Invalid email or password.' }
    }

    const payload: UserSessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'USER' | 'ADMIN',
    }

    const token = signToken(payload)
    await setAuthCookie(token)

    return { success: true, user: payload }
  } catch (error) {
    console.error('Sign in error:', error)
    return { success: false, error: 'Failed to sign in. Please try again.' }
  }
}

export async function signOutUser() {
  try {
    await clearAuthCookie()
    return { success: true }
  } catch (error) {
    console.error('Sign out error:', error)
    return { success: false, error: 'Failed to sign out.' }
  }
}

export async function getAuthSession() {
  try {
    const session = await getCurrentUser()
    if (!session) {
      return { success: true, user: null }
    }

    // Verify user still exists in DB and fetch updated role
    const dbUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, name: true, role: true },
    })

    if (!dbUser) {
      await clearAuthCookie()
      return { success: true, user: null }
    }

    const updatedPayload: UserSessionPayload = {
      userId: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role as 'USER' | 'ADMIN',
    }

    return { success: true, user: updatedPayload }
  } catch (error) {
    console.error('Get auth session error:', error)
    return { success: false, error: 'Failed to fetch auth session' }
  }
}
