import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Link from "../ui/Link";
import Card from "../ui/Card";

interface SignUpScreenProps {
  onSignUp: (email: string, password: string) => Promise<string | undefined>;
  onNavigateToSignIn: () => void;
}

export default function SignUpScreen({ onSignUp, onNavigateToSignIn }: SignUpScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const [submitError, setSubmitError] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Enter a valid email";
    if (!password.trim()) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Minimum 6 characters";

    if (!confirmPassword.trim()) newErrors.confirmPassword = "Confirm your password";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitError(undefined);
    setSuccessMessage(undefined);
    setIsSubmitting(true);
    try {
      const message = await onSignUp(email.trim(), password);
      if (message) setSuccessMessage(message);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to create your account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create Your Account</h1>
          <p className="text-sm text-slate-500 mt-1">Start tracking your ETF portfolio today</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}
            {successMessage && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                <p className="text-sm text-emerald-700">{successMessage}</p>
              </div>
            )}
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
              }}
              error={errors.email}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
              }}
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: undefined }));
              }}
              error={errors.confirmPassword}
            />

            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating Account…" : "Create Account"}</Button>
          </form>
        </Card>

        <p className="text-center mt-6 text-sm text-slate-500">
          Already have an account?{" "}
          <Link onClick={onNavigateToSignIn}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}