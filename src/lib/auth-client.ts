// Client-side authentication for demo purposes
// In production, use server-side auth with proper database

interface User {
  id: string;
  email: string;
  name?: string;
}

interface StoredUser extends User {
  password: string;
  resetToken?: string;
  resetTokenExpires?: string;
}

export async function hashPassword(password: string): Promise<string> {
  // Simple client-side encoding for demo
  return btoa(password);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  // Simple client-side verification for demo
  return btoa(password) === hashedPassword;
}

export async function createUser(email: string, password: string, name?: string): Promise<User> {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be called on the client side');
  }

  const users = JSON.parse(localStorage.getItem('users') || '[]') as StoredUser[];
  
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await hashPassword(password);
  const newUser: StoredUser = {
    id: Math.random().toString(36).substring(2, 15),
    email,
    password: hashedPassword,
    name
  };

  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  return { id: newUser.id, email: newUser.email, name: newUser.name };
}

export async function authenticateUser(email: string, password: string): Promise<User> {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be called on the client side');
  }

  const users = JSON.parse(localStorage.getItem('users') || '[]') as StoredUser[];
  
  const user = users.find(u => u.email === email);
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
  if (typeof window === 'undefined') {
    throw new Error('This function can only be called on the client side');
  }

  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes from now

  const users = JSON.parse(localStorage.getItem('users') || '[]') as StoredUser[];
  const userIndex = users.findIndex(u => u.email === email);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  users[userIndex].resetToken = token;
  users[userIndex].resetTokenExpires = expires;
  localStorage.setItem('users', JSON.stringify(users));

  return token;
}

export async function verifyResetToken(token: string): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }

  const users = JSON.parse(localStorage.getItem('users') || '[]') as StoredUser[];
  const user = users.find(u => u.resetToken === token && u.resetTokenExpires);

  if (!user || !user.resetTokenExpires) {
    return false;
  }

  return new Date(user.resetTokenExpires) > new Date();
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be called on the client side');
  }

  const users = JSON.parse(localStorage.getItem('users') || '[]') as StoredUser[];
  const userIndex = users.findIndex(u => u.resetToken === token);

  if (userIndex === -1 || !users[userIndex].resetTokenExpires) {
    throw new Error('Invalid or expired token');
  }

  const expires = new Date(users[userIndex].resetTokenExpires!);
  if (expires <= new Date()) {
    throw new Error('Token has expired');
  }

  const hashedPassword = await hashPassword(newPassword);
  users[userIndex].password = hashedPassword;
  users[userIndex].resetToken = undefined;
  users[userIndex].resetTokenExpires = undefined;
  
  localStorage.setItem('users', JSON.stringify(users));
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  // In a real app, you would use a service like SendGrid, Nodemailer, etc.
  // For demo purposes, we'll just log the reset link
  const resetLink = `${window.location.origin}/reset-password?token=${token}`;
  console.log(`Password reset link for ${email}: ${resetLink}`);
  
  // For demo, show an alert
  alert(`Password reset link sent to ${email}!\n\nLink: ${resetLink}\n\n(See console for details)`);
}
