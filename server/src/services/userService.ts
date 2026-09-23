import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../database/prisma'

export interface RegisterInput {
  email: string
  password: string
  displayName: string
}

export interface LoginInput {
  email: string
  password: string
}

export class UserService {
  async register(data: RegisterInput) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      throw new Error('User already exists')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        displayName: data.displayName,
      },
    })

    // Generate token
    const token = this.generateToken(user.id, user.email)

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        profilePicture: user.profilePicture,
        aboutText: user.aboutText,
      },
    }
  }

  async login(data: LoginInput) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user) {
      throw new Error('Invalid credentials')
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password)
    if (!isPasswordValid) {
      throw new Error('Invalid credentials')
    }

    // Update last seen
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() },
    })

    // Generate token
    const token = this.generateToken(user.id, user.email)

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        profilePicture: user.profilePicture,
        aboutText: user.aboutText,
      },
    }
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      profilePicture: user.profilePicture,
      aboutText: user.aboutText,
      isActive: user.isActive,
      lastSeenAt: user.lastSeenAt,
      createdAt: user.createdAt,
    }
  }

  async updateProfile(userId: string, data: Partial<{
    displayName: string
    aboutText: string
    profilePicture: string
  }>) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    })

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      profilePicture: user.profilePicture,
      aboutText: user.aboutText,
    }
  }

  async updatePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password)
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect')
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return { message: 'Password updated successfully' }
  }

  private generateToken(userId: string, email: string): string {
    const secret = (process.env.JWT_SECRET || 'secret') as jwt.Secret
    const expiresIn = (process.env.JWT_EXPIRATION || '15m') as jwt.SignOptions['expiresIn']

    return jwt.sign(
      { id: userId, email },
      secret,
      { expiresIn }
    )
  }

  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'secret'
      ) as { id: string; email: string }
      return decoded
    } catch (err) {
      throw new Error('Invalid token')
    }
  }
}

export const userService = new UserService()
