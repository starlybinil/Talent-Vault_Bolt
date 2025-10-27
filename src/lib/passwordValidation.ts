export interface PasswordStrength {
  isValid: boolean
  score: number
  feedback: string[]
  requirements: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumber: boolean
    hasSpecialChar: boolean
  }
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }

  const feedback: string[] = []
  let score = 0

  if (!requirements.minLength) {
    feedback.push('Password must be at least 8 characters long')
  } else {
    score += 20
  }

  if (!requirements.hasUppercase) {
    feedback.push('Include at least one uppercase letter (A-Z)')
  } else {
    score += 20
  }

  if (!requirements.hasLowercase) {
    feedback.push('Include at least one lowercase letter (a-z)')
  } else {
    score += 20
  }

  if (!requirements.hasNumber) {
    feedback.push('Include at least one number (0-9)')
  } else {
    score += 20
  }

  if (!requirements.hasSpecialChar) {
    feedback.push('Include at least one special character (!@#$%^&*...)')
  } else {
    score += 20
  }

  const isValid = Object.values(requirements).every(req => req)

  return {
    isValid,
    score,
    feedback,
    requirements,
  }
}

export function getPasswordStrengthLabel(score: number): {
  label: string
  color: string
} {
  if (score < 40) {
    return { label: 'Weak', color: 'text-red-400' }
  } else if (score < 60) {
    return { label: 'Fair', color: 'text-orange-400' }
  } else if (score < 80) {
    return { label: 'Good', color: 'text-yellow-400' }
  } else if (score < 100) {
    return { label: 'Strong', color: 'text-green-400' }
  } else {
    return { label: 'Very Strong', color: 'text-green-500' }
  }
}
