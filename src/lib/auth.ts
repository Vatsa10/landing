import bcrypt from 'bcryptjs';
import { prisma } from './database';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser(email: string, password: string, name?: string) {
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name
    }
  });

  return { id: user.id, email: user.email, name: user.name };
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  return { id: user.id, email: user.email, name: user.name };
}

export async function generateResetToken(email: string): Promise<string> {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  await prisma.user.update({
    where: { email },
    data: {
      resetToken: token,
      resetTokenExpires: expires
    }
  });

  return token;
}

export async function verifyResetToken(token: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpires: {
        gt: new Date()
      }
    }
  });

  return !!user;
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpires: {
        gt: new Date()
      }
    }
  });

  if (!user) {
    throw new Error('Invalid or expired token');
  }

  const hashedPassword = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpires: null
    }
  });
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  // In a real app, you would use a service like SendGrid, Nodemailer, etc.
  // For demo purposes, we'll just log the reset link
  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  console.log(`Password reset link for ${email}: ${resetLink}`);
  
  // TODO: Implement actual email sending
  // Example with Nodemailer:
  // const transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: process.env.EMAIL_USER,
  //     pass: process.env.EMAIL_PASS
  //   }
  // });
  //
  // await transporter.sendMail({
  //   from: process.env.EMAIL_USER,
  //   to: email,
  //   subject: 'Password Reset - Aapka Aarogya Kosh',
  //   html: `
  //     <h2>Password Reset Request</h2>
  //     <p>Click the link below to reset your password. This link will expire in 10 minutes.</p>
  //     <a href="${resetLink}">Reset Password</a>
  //     <p>If you didn't request this, please ignore this email.</p>
  //   `
  // });
}
