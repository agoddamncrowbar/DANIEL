import { useState } from "react";
import { useAuth } from "@/context/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function SignupForm() {
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(form);
      window.location.href = "/";
    } catch {
      setError("Failed to create account");
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-20 p-6 shadow-lg">
      <CardContent>
        <h2 className="text-2xl font-semibold mb-6 text-center">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div>
            <Label>Phone</Label>
            <Input name="phone" value={form.phone} onChange={handleChange} />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" name="password" value={form.password} onChange={handleChange} required />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button className="w-full mt-2" type="submit">Sign Up</Button>
        </form>
      </CardContent>
    </Card>
  );
}
